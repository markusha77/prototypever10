import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Input from './ui/Input';
import TextArea from './ui/TextArea';
import MultiSelect from './ui/MultiSelect';
import Button from './ui/Button';
import FileUpload from './ui/FileUpload';
import { CATEGORIES, TECHNOLOGIES } from '../../types';
import { Link, Tag, Code, ArrowLeft } from 'lucide-react';

// Define Project type to match the context expectations
interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  demoUrl?: string;
  repoUrl?: string;
  categories: string[];
  technologies: string[];
  additionalImages?: string[];
  createdAt: string;
}

interface ProjectImage {
  url: string;
  file: File;
  isMain: boolean;
}

const ProjectForm: React.FC = () => {
  const { profile, addProject, updateProject } = useProfile();
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const emptyProject: Project = {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    image: '',
    demoUrl: '',
    repoUrl: '',
    categories: [],
    technologies: [],
    createdAt: new Date().toISOString()
  };
  
  const existingProject = projectId && profile?.projects 
    ? profile.projects.find(p => p.id === projectId) 
    : null;
  
  const [formData, setFormData] = useState<Project>(existingProject || emptyProject);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);

  useEffect(() => {
    if (projectId && !existingProject) {
      navigate('/projects');
    }
    
    // Initialize project images if editing an existing project
    if (existingProject && existingProject.image) {
      setProjectImages([
        { url: existingProject.image, file: new File([], 'main-image'), isMain: true }
      ]);
      
      // If the project has additional images, add them too
      if (existingProject.additionalImages && existingProject.additionalImages.length > 0) {
        const additionalImageObjects = existingProject.additionalImages.map(url => ({
          url,
          file: new File([], `additional-image-${Math.random()}`),
          isMain: false
        }));
        
        setProjectImages(prev => [...prev, ...additionalImageObjects]);
      }
    }
  }, [projectId, existingProject, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoriesChange = (categories: string[]) => {
    setFormData(prev => ({ ...prev, categories }));
  };

  const handleTechnologiesChange = (technologies: string[]) => {
    setFormData(prev => ({ ...prev, technologies }));
  };

  const handleImageSelect = (file: File, isMain: boolean = false) => {
    // Create a temporary URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    if (isMain) {
      // Update main image in form data
      setFormData(prev => ({ ...prev, image: imageUrl }));
      
      // Remove any existing main image from projectImages
      const updatedImages = projectImages.map(img => ({
        ...img,
        isMain: false
      }));
      
      // Add the new main image
      setProjectImages([
        ...updatedImages,
        { url: imageUrl, file, isMain: true }
      ]);
    } else {
      // Add to additional images
      setProjectImages(prev => [
        ...prev,
        { url: imageUrl, file, isMain: false }
      ]);
    }
  };

  const handleMultipleFilesSelect = (files: File[]) => {
    // Process each file
    files.forEach((file, index) => {
      const imageUrl = URL.createObjectURL(file);
      const isMain = index === 0 && projectImages.length === 0;
      
      if (isMain) {
        // Set as main image in form data
        setFormData(prev => ({ ...prev, image: imageUrl }));
      }
      
      // Add to project images
      setProjectImages(prev => [
        ...prev,
        { url: imageUrl, file, isMain }
      ]);
    });
  };

  const handleClearImage = (imageUrl?: string) => {
    if (!imageUrl) {
      // Clear main image
      const mainImage = projectImages.find(img => img.isMain);
      if (mainImage) {
        // Remove the main image
        setProjectImages(prev => prev.filter(img => !img.isMain));
        
        // Set a new main image if there are other images
        const remainingImages = projectImages.filter(img => !img.isMain);
        if (remainingImages.length > 0) {
          const newMainImage = remainingImages[0];
          setFormData(prev => ({ ...prev, image: newMainImage.url }));
          
          setProjectImages(prev => 
            prev.map(img => 
              img.url === newMainImage.url 
                ? { ...img, isMain: true } 
                : img
            )
          );
        } else {
          setFormData(prev => ({ ...prev, image: '' }));
        }
      }
    } else {
      // Clear a specific image
      setProjectImages(prev => prev.filter(img => img.url !== imageUrl));
    }
  };

  const handleSetMainImage = (imageUrl: string) => {
    // Update form data with new main image
    setFormData(prev => ({ ...prev, image: imageUrl }));
    
    // Update project images to reflect the new main image
    setProjectImages(prev => 
      prev.map(img => ({
        ...img,
        isMain: img.url === imageUrl
      }))
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.categories.length === 0) newErrors.categories = 'Select at least one category';
    if (formData.technologies.length === 0) newErrors.technologies = 'Select at least one technology';
    if (!formData.image) newErrors.image = 'At least one image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // In a real app, you would upload the image files to a server here
    // and get back permanent URLs to store in the project data
    
    // Get additional images (non-main images)
    const additionalImages = projectImages
      .filter(img => !img.isMain)
      .map(img => img.url);
    
    // Update the project data with all images
    const updatedProject = {
      ...formData,
      additionalImages
    };
    
    if (existingProject) {
      updateProject(updatedProject);
    } else {
      addProject(updatedProject);
    }
    
    navigate('/projects');
  };

  // Get main image URL and additional image URLs for the FileUpload component
  const mainImageUrl = formData.image || '';
  const additionalImageUrls = projectImages
    .filter(img => !img.isMain)
    .map(img => img.url);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-6 px-8">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/projects')}
            className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
            aria-label="Back to projects"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h2 className="text-2xl font-bold text-white">
            {existingProject ? 'Edit Project' : 'Add New Project'}
          </h2>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8">
        <div className="space-y-8">
          <div className="space-y-6">
            <Input
              label="Project Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. E-commerce Platform"
              error={errors.title}
              fullWidth
              required
            />
            
            <TextArea
              label="Project Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project, its features, and what problem it solves"
              error={errors.description}
              fullWidth
              required
              rows={5}
            />
            
            <FileUpload 
              onFileSelect={handleImageSelect}
              onMultipleFilesSelect={handleMultipleFilesSelect}
              currentImageUrl={mainImageUrl}
              additionalImages={additionalImageUrls}
              onClearImage={handleClearImage}
              onSetMainImage={handleSetMainImage}
              multiple={true}
            />
            {errors.image && <p className="mt-1.5 text-sm text-red-600">{errors.image}</p>}
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Project Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-indigo-50">
                    <Link size={18} className="text-indigo-600" />
                  </div>
                  <Input
                    label="Demo URL"
                    name="demoUrl"
                    value={formData.demoUrl || ''}
                    onChange={handleChange}
                    placeholder="https://yourdemo.com"
                    fullWidth
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-indigo-50">
                    <Code size={18} className="text-indigo-600" />
                  </div>
                  <Input
                    label="Repository URL"
                    name="repoUrl"
                    value={formData.repoUrl || ''}
                    onChange={handleChange}
                    placeholder="https://github.com/yourusername/project"
                    fullWidth
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-2 rounded-full bg-indigo-50">
                    <Tag size={18} className="text-indigo-600" />
                  </div>
                  <label className="block text-sm font-medium text-gray-700">
                    Categories
                  </label>
                </div>
                <MultiSelect
                  options={CATEGORIES}
                  selectedValues={formData.categories}
                  onChange={handleCategoriesChange}
                  placeholder="Select categories"
                  error={errors.categories}
                />
                {errors.categories && <p className="mt-1.5 text-sm text-red-600">{errors.categories}</p>}
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-2 rounded-full bg-indigo-50">
                    <Code size={18} className="text-indigo-600" />
                  </div>
                  <label className="block text-sm font-medium text-gray-700">
                    Technologies Used
                  </label>
                </div>
                <MultiSelect
                  options={TECHNOLOGIES}
                  selectedValues={formData.technologies}
                  onChange={handleTechnologiesChange}
                  placeholder="Select technologies"
                  error={errors.technologies}
                />
                {errors.technologies && <p className="mt-1.5 text-sm text-red-600">{errors.technologies}</p>}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/projects')}
          >
            Cancel
          </Button>
          <Button type="submit">
            {existingProject ? 'Update Project' : 'Add Project'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
