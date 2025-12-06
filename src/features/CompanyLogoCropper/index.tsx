/**──────────────────────────────────────────────────────────────────────┐
│  🏢 COMPANY LOGO CROPPER - Complete Logo Component                    │
│  /src/features/CompanyLogoCropper/index.tsx                           │
│                                                                        │
│  Complete company logo management with upload/crop - exact clone of   │
│  UserButton architecture for instant optimistic UI updates.           │
│                                                                        │
│  FEATURES:                                                             │
│  - Logo display with instant optimistic updates                       │
│  - Upload/crop functionality                                          │
│  - No flash on refresh (persistent state)                             │
└────────────────────────────────────────────────────────────────────────┘ */

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useMutation, useConvex } from "convex/react";
import Cropper from "react-easy-crop";
import { api } from '@/convex/_generated/api';
import { refreshSessionAfterUpload } from '@/app/actions/user-mutations';
import { Id } from "@/convex/_generated/dataModel";
import { useFuse } from "@/store/fuse";
import { Icon, Tooltip } from "@/prebuilts";

import './company-logo-cropper.css';

export default function CompanyLogoCropper() {
  const user = useFuse((s) => s.user);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl.generateUploadUrl);
  const uploadBrandLogo = useMutation(api.domains.admin.users.api.uploadBrandLogo);
  const convex = useConvex();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Three-tier persistent state (exact same pattern as UserButton)
  const [committedUrl, setCommittedUrl] = useState<string | null>(null);
  const [optimisticUrl, setOptimisticUrl] = useState<string | null>(null);
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);

  const waitForImageUrl = async (storageId: Id<"_storage">) => {
    for (let i = 0; i < 10; i++) {
      const url = await convex.query(api.storage.getImageUrl.getImageUrl, { storageId });
      if (url) return url;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error("Image URL did not hydrate in time");
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const onCropComplete = useCallback((_: { x: number; y: number; width: number; height: number }, croppedPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", error => reject(error));
      img.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const maxSize = 400;
    let targetWidth = pixelCrop.width;
    let targetHeight = pixelCrop.height;

    if (targetWidth > maxSize || targetHeight > maxSize) {
      const scale = Math.min(maxSize / targetWidth, maxSize / targetHeight);
      targetWidth = Math.round(targetWidth * scale);
      targetHeight = Math.round(targetHeight * scale);
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetWidth,
      targetHeight
    );
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas export failed"));
      }, "image/png");
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      console.error("Only image files are allowed");
      return;
    }

    setSelectedFile(file);
    setShowModal(true);
    setIsCropping(true);
  };

  const handleUpload = async () => {
    if (!previewUrl && !selectedFile) {
      console.error("Please select an image first");
      return;
    }

    try {
      let fileToUpload: File | null = selectedFile;
      let optimisticBlobUrl: string | null = null;

      if (previewUrl && isCropping && croppedAreaPixels) {
        const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);
        fileToUpload = new File([croppedBlob], "companylogo.png", { type: "image/png" });
        optimisticBlobUrl = URL.createObjectURL(croppedBlob);
      }

      if (!fileToUpload) {
        throw new Error("No image to upload");
      }

      const currentLogo = optimisticUrl || committedUrl || user?.brandLogoUrl || "/images/sitewide/enterprise.png";
      setPreviousUrl(currentLogo);
      if (optimisticBlobUrl) {
        setOptimisticUrl(optimisticBlobUrl);
      }

      setIsCropping(false);
      setSelectedFile(null);
      setShowModal(false);
      setIsUploading(true);

      const url = await generateUploadUrl({ clerkId: user!.clerkId });
      // eslint-disable-next-line no-restricted-globals -- Convex-generated upload URL for file storage
      const uploadRes = await fetch(url, {
        method: "POST",
        body: fileToUpload,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const { storageId } = await uploadRes.json();
      await uploadBrandLogo({ fileId: storageId, clerkId: user!.clerkId });
      const newLogoUrl = await waitForImageUrl(storageId);

      setCommittedUrl(newLogoUrl);
      setOptimisticUrl(null);
      setPreviousUrl(null);

      if (optimisticBlobUrl) {
        URL.revokeObjectURL(optimisticBlobUrl);
      }

      // Refresh FUSE store
      const freshUser = await convex.query(api.domains.admin.users.api.getCurrentUser, {
        clerkId: user!.clerkId,
      });
      if (freshUser) {
        const { setUser } = useFuse.getState();
        setUser({
          id: String(freshUser._id),
          convexId: String(freshUser._id),
          clerkId: freshUser.clerkId,
          email: freshUser.email || '',
          emailVerified: freshUser.emailVerified,
          firstName: freshUser.firstName,
          lastName: freshUser.lastName,
          avatarUrl: freshUser.avatarUrl,
          brandLogoUrl: freshUser.brandLogoUrl,
          rank: freshUser.rank as 'crew' | 'captain' | 'commodore' | 'admiral' | null | undefined,
          setupStatus: freshUser.setupStatus as 'pending' | 'complete' | null | undefined,
          businessCountry: freshUser.businessCountry,
          entityName: freshUser.entityName,
          socialName: freshUser.socialName,
          mirorAvatarProfile: freshUser.mirorAvatarProfile,
          mirorEnchantmentEnabled: freshUser.mirorEnchantmentEnabled,
          mirorEnchantmentTiming: freshUser.mirorEnchantmentTiming
        });
        console.log('✅ FUSE store updated with new company logo:', freshUser.brandLogoUrl?.substring(0, 50));
      }

      // Refresh session cookie with new logo
      console.log('🔄 Refreshing session cookie...');
      const refreshResult = await refreshSessionAfterUpload();
      console.log('🔄 Session refresh result:', refreshResult);
    } catch (err) {
      console.error("Upload failed:", err);
      if (previousUrl) {
        setOptimisticUrl(null);
        if (optimisticUrl) {
          URL.revokeObjectURL(optimisticUrl);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  // Compute logo source with fallback chain (exact same pattern as UserButton line 284)
  const logoSrc = optimisticUrl || committedUrl || user?.brandLogoUrl || "/images/sitewide/enterprise.png";

  if (!user) {
    return <div className="ft-companylogo-cropper-loading" />;
  }

  return (
    <>
      <img
        src={logoSrc}
        alt="Company Logo"
        width={32}
        height={32}
        className="ft-companylogo-cropper-image"
        onClick={(e) => e.stopPropagation()}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="ft-companylogo-cropper-file-input"
        onChange={handleFileChange}
      />

      {showModal && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="ft-companylogo-cropper-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ft-companylogo-cropper-modal-header">
              Resize and crop company logo
              <Tooltip.basic content="Use your mouse scroll wheel to zoom and adjust image" side="top">
                <Icon variant="info" size="sm" className="ft-companylogo-cropper-modal-header-icon" />
              </Tooltip.basic>
            </div>

            {previewUrl && isCropping && (
              <div
                className="ft-companylogo-cropper-container"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Cropper
                  image={previewUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  minZoom={0.5}
                  maxZoom={3}
                  restrictPosition={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            )}

            <div className="ft-companylogo-cropper-upload-actions">
              {previewUrl && (
                <button
                  className={`ft-companylogo-cropper-upload-button ${isUploading ? 'ft-companylogo-cropper-upload-button--uploading' : ''}`}
                  onClick={() => {
                    if (isUploading) return;
                    handleUpload();
                  }}
                >
                  {isUploading ? "Uploading..." : "Save cropped image"}
                </button>
              )}
            </div>
          </div>

          <div
            className="ft-companylogo-cropper-backdrop ft-companylogo-cropper-backdrop--dimmed"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              closeModal();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
        </>,
        document.body
      )}
    </>
  );
}
