import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation, 
  useGetCategoryDetailsQuery 
} from '../../slices/categoriesApiSlice';
import Loader from '../../components/Loader';

// ✅ CLOUDINARY CONFIG
const CLOUD_NAME = "ddk25vd4c"; 
const UPLOAD_PRESET = "Sports";

// ✅ STYLE CONFIGURATION (Updated to Navy Blue & Orange Theme)
const CSS_OVERRIDES = `
  .split-container { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; max-width: 1100px; margin: 0 auto; align-items: start; }
  
  .modern-input { width: 100%; padding: 14px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; outline: none; transition: all 0.3s ease; background: #fff; }
  /* ✅ Focus Color changed to Orange */
  .modern-input:focus { border-color: #FF6F00; box-shadow: 0 0 0 4px rgba(255, 111, 0, 0.1); }
  
  /* ✅ Button Hover changed to Orange */
  .primary-btn:hover:not(:disabled) { background-color: #FF6F00 !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 33, 71, 0.3); }
  
  .secondary-btn:hover { color: #FF6F00 !important; text-decoration: underline; }
  .fade-in { animation: fadeIn 0.6s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 900px) {
    .split-container { grid-template-columns: 1fr !important; gap: 25px !important; }
    .preview-card { order: -1 !important; height: auto !important; padding: 20px !important; }
    .image-box { height: 200px !important; }
    .form-card { padding: 25px !important; }
    .heading { font-size: 22px !important; }
    .action-buttons { flex-direction: column !important; gap: 15px !important; }
    .primary-btn, .cancel-btn { width: 100% !important; padding: 12px !important; text-align: center !important; }
  }
`;

const CategoryEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // REDUX
  const { data: category, isLoading: loadingData, refetch } = useGetCategoryDetailsQuery(id, {
    skip: !id,
  });

  const [createCategory, { isLoading: loadingCreate }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: loadingUpdate }] = useUpdateCategoryMutation();

  // LOCAL STATE
  const [name, setName] = useState('');
  const [description, setDescription] = useState(''); 
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (category && id) {
      setName(category.name);
      setDescription(category.description || '');
      setPreview(category.image);
    }
  }, [category, id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file)); 
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    
    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
      return res.data.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new Error("Image upload failed");
    }
  };

  const handleSubmit = async () => {
    if (!name) return toast.error("Category name is required!");
    if (!id && !imageFile && !preview) return toast.error("Please select an image!");

    try {
      let imageUrl = preview; 

      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadToCloudinary(imageFile);
        setUploading(false);
      }

      const categoryData = { name, description, image: imageUrl };

      if (id) {
        await updateCategory({ categoryId: id, ...categoryData }).unwrap();
        toast.success("Category Updated Successfully!");
      } else {
        await createCategory(categoryData).unwrap();
        toast.success("New Category Added!");
      }
      
      refetch();
      navigate('/admin/categorylist');

    } catch (err) {
      setUploading(false);
      toast.error(err?.data?.message || err.error || "Something went wrong");
    }
  };

  const isLoading = loadingData || loadingCreate || loadingUpdate || uploading;

  return (
    <div style={{ background: '#f4f7f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Poppins', sans-serif" }}>
      
      <style>{CSS_OVERRIDES}</style>

      <div className="main-container fade-in">
        
        {/* Top Bar */}
        <div style={{ maxWidth: '1100px', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/admin/categorylist')} 
            className="secondary-btn"
            style={STYLES.backBtn}
          >
            ❮ Back to Categories
          </button>
        </div>

        {loadingData ? <Loader /> : (
          <div className="split-container">
            
            {/* FORM SECTION */}
            <div style={STYLES.formCard} className="form-card">
              <h2 style={STYLES.heading} className="heading">{id ? "Edit Category" : "Add New Category"}</h2>
              <p style={STYLES.subHeading}>{id ? "Update category details below." : "Fill in the details to create a new category."}</p>
              
              <div style={{ marginTop: '30px' }}>
                
                <div style={{ marginBottom: '25px' }}>
                  <label style={STYLES.label}>Category Name</label>
                  <input 
                    type="text" 
                    className="modern-input"
                    placeholder="e.g. Football Kits..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={STYLES.label}>Description <span style={{fontWeight:'normal', color:'#999'}}>(Optional)</span></label>
                  <textarea 
                    rows="4"
                    className="modern-input"
                    placeholder="Short description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <label style={STYLES.label}>Upload Banner Image</label>
                  <div style={STYLES.fileWrapper}>
                    <input 
                      type="file" 
                      onChange={handleImageChange}
                      style={{ width: '100%', cursor: 'pointer', fontSize: '14px', color: '#555' }}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '15px' }} className="action-buttons">
                  <button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="primary-btn"
                    style={{
                      ...STYLES.primaryBtn,
                      // ✅ Changed to Navy Blue (Professional)
                      background: isLoading ? '#ccc' : '#002147', 
                      color: '#fff',
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoading ? (uploading ? "Uploading Image..." : "Saving...") : (id ? "Update Category" : "Publish Category")}
                  </button>
                  
                  <button 
                    onClick={() => navigate('/admin/categorylist')}
                    style={STYLES.cancelBtn}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>

            {/* PREVIEW SECTION */}
            <div style={STYLES.previewCard} className="preview-card">
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#002147', marginBottom: '15px' }}>Live Preview</h3>
              
              <div style={STYLES.imageBox} className="image-box">
                {preview ? (
                  <img src={preview} alt="Preview" style={STYLES.previewImg} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#aaa' }}>
                    <i className="fa-regular fa-image" style={{ fontSize: '40px', marginBottom: '10px' }}></i>
                    <p style={{ fontSize: '14px' }}>No image selected</p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#002147', margin: '0' }}>
                  {name || "Category Name"}
                </h4>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                  {description || "Category description will appear here..."}
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

// ✅ STYLES OBJECT
const STYLES = {
  backBtn: {
    background: 'none', border: 'none', color: '#002147', 
    cursor: 'pointer', fontWeight: '700', fontSize: '14px', 
    transition: '0.2s', display: 'flex', alignItems: 'center', gap: '5px'
  },
  primaryBtn: {
    flex: 1, padding: '14px', border: 'none', borderRadius: '8px',
    fontSize: '16px', fontWeight: '700', transition: 'all 0.3s ease'
  },
  cancelBtn: {
    padding: '14px 25px', background: '#fff', border: '1px solid #ddd', 
    borderRadius: '8px', fontSize: '15px', fontWeight: '600', 
    color: '#555', cursor: 'pointer'
  },
  formCard: {
    background: '#fff', padding: '40px', borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #fff'
  },
  heading: { fontSize: '26px', fontWeight: '800', color: '#002147', marginBottom: '8px' },
  subHeading: { fontSize: '14px', color: '#666', margin: 0 },
  label: { display: 'block', fontSize: '14px', fontWeight: '700', color: '#002147', marginBottom: '8px' },
  fileWrapper: { padding: '12px', border: '1px dashed #ccc', borderRadius: '8px', background: '#f9f9f9' },
  previewCard: {
    background: '#fff', padding: '25px', borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'sticky', top: '20px',
    height: 'fit-content'
  },
  imageBox: {
    width: '100%', height: '220px', background: '#f4f7f9', 
    borderRadius: '12px', overflow: 'hidden', display: 'flex', 
    alignItems: 'center', justifyContent: 'center', border: '1px solid #eee'
  },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover' }
};

export default CategoryEditScreen;