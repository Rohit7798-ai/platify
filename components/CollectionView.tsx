
import React, { useState, useRef } from 'react';
import { PlantItem } from '../types';

interface CollectionViewProps {
  collection: PlantItem[];
  onDelete: (id: string) => void;
  onPlantClick: (plant: PlantItem) => void;
  onUploadClick: (file: File) => void;
  onBack: () => void;
}

const CollectionView: React.FC<CollectionViewProps> = ({ collection, onDelete, onPlantClick, onUploadClick, onBack }) => {
  const [plantToDelete, setPlantToDelete] = useState<PlantItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteClick = (e: React.MouseEvent, plant: PlantItem) => {
    e.stopPropagation();
    setPlantToDelete(plant);
  };

  const confirmDelete = () => {
    if (plantToDelete) {
      onDelete(plantToDelete.id);
      setPlantToDelete(null);
    }
  };

  const cancelDelete = () => {
    setPlantToDelete(null);
  };

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadClick(e.target.files[0]);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 px-4 py-3 justify-between backdrop-blur-md">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <button
            onClick={onBack}
            className="flex items-center justify-center size-10 rounded-full text-col-text-light dark:text-col-text-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        <h2 className="text-xl font-semibold leading-tight flex-1 text-center font-display text-col-text-light dark:text-col-text-dark">My Collection</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex items-center justify-center size-10 rounded-full text-col-text-light dark:text-col-text-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>

      <main className="flex-grow px-5 pb-28 pt-2">
        <div className="flex flex-col gap-4">

          {/* Add New Plant Card */}
          <div
            onClick={handleAddClick}
            className="flex items-center gap-4 bg-col-surface-light dark:bg-col-surface-dark border-2 border-dashed border-col-primary dark:border-col-primary-dark/50 p-3 rounded-lg cursor-pointer hover:bg-col-primary-light/50 dark:hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center justify-center aspect-square rounded-lg size-24 shrink-0 bg-col-primary-light dark:bg-white/5 text-col-primary-dark dark:text-col-primary transition-colors">
              <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">add_a_photo</span>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-base font-semibold text-col-text-light dark:text-col-text-dark">Identify New Plant</p>
              <p className="text-col-text-sec-light dark:text-col-text-sec-dark text-xs">Upload an image to add to collection</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {collection.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
              <span className="material-symbols-outlined text-4xl mb-2 text-col-text-sec-light dark:text-col-text-sec-dark">local_florist</span>
              <p className="text-col-text-sec-light dark:text-col-text-sec-dark">Your collection is empty.</p>
            </div>
          ) : (
            collection.map((plant) => (
              <div
                key={plant.id}
                onClick={() => onPlantClick(plant)}
                className="flex items-center gap-4 bg-col-surface-light dark:bg-col-surface-dark p-3 rounded-lg shadow-subtle dark:shadow-subtle-dark cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-24 shrink-0"
                  style={{ backgroundImage: `url("${plant.image}")` }}></div>
                <div className="flex flex-1 flex-col justify-between self-stretch py-1">
                  <div>
                    <p className="text-base font-semibold leading-normal text-col-text-light dark:text-col-text-dark">{plant.name}</p>
                    <p className="text-col-text-sec-light dark:text-col-text-sec-dark text-xs font-normal leading-normal mt-1">Identified: {plant.date}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {plant.tags.map((tag, index) => (
                      <span key={index} className="text-xs font-medium text-col-primary-dark dark:text-col-primary-light bg-col-primary-light dark:bg-col-primary-dark/30 px-3 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end self-stretch text-col-text-sec-light dark:text-col-text-sec-dark">
                  <button
                    onClick={(e) => handleDeleteClick(e, plant)}
                    className="size-9 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    title="Remove plant"
                  >
                    <span className="material-symbols-outlined !text-xl">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {plantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={cancelDelete}></div>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-col-surface-light dark:bg-col-surface-dark shadow-2xl ring-1 ring-black/5">
            <div className="p-6">
              <h3 className="text-lg font-semibold leading-6 text-col-text-light dark:text-col-text-dark mb-2">
                Remove Plant?
              </h3>
              <p className="text-sm text-col-text-sec-light dark:text-col-text-sec-dark">
                Are you sure you want to remove <span className="font-medium text-col-text-light dark:text-col-text-dark">{plantToDelete.name}</span> from your collection? This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-col-text-light dark:text-col-text-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionView;
