import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  useGetProductDetailsQuery, 
  useUpdateProductMutation,
  useCreateProductMutation 
} from '../../slices/productsApiSlice';
import { useGetCategoriesQuery } from '../../slices/categoriesApiSlice';
import Loader from '../../components/Loader';

// ✅ CLOUDINARY CONFIG
const CLOUD_NAME = "duqwy0su0"; 
const UPLOAD_PRESET = "Sports";

// ✅ STYLE CONFIGURATION
const CSS_OVERRIDES = `
  .stylish-input:focus { border-color: #FF6F00 !important; box-shadow: 0 0 8px rgba(255, 111, 0, 0.2); }
  .img-wrapper { transition: all 0.3s ease; }
  .img-wrapper:hover { transform: scale(1.02); }
  .img-wrapper:hover .overlay-btn { opacity: 1 !important; }
  
  .publish-btn:hover:not(:disabled) { background-color: #e65c00 !important; transform: translateY(-2px); }
  .back-btn:hover { background-color: #002147 !important; color: #fff !important; }
  
  .size-hover:hover {
      transform: scale(1.1);
      border-color: #002147 !important;
      color: #002147 !important;
      box-shadow: 0 4px 10px rgba(0, 33, 71, 0.2);
  }

  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 111, 0, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(255, 111, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 111, 0, 0); } }
  .thumb-badge { animation: pulse 2s infinite; }

  @media (max-width: 900px) {
      .form-wrapper-mobile { flex-direction: column !important; }
      .left-col-mobile, .right-col-mobile { width: 100% !important; flex: none !important; }
      .price-stock-row { flex-direction: column !important; gap: 15px !important; }
      .size-box-mobile { justify-content: center !important; }
      .color-header-mobile { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
      .add-color-btn { width: 100% !important; }
  }
`;

const ProductEditScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!productId; 

  // 1. Redux Hooks
  const { data: product, isLoading: loadingProduct } = useGetProductDetailsQuery(productId, { skip: !isEditMode });
  const { data: categoriesData } = useGetCategoriesQuery(); 
  
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();

  // 2. Local State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');

  // Complex State (Sizes & Colors)
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [colors, setColors] = useState([{ colorName: '', images: [] }]);
  const [uploading, setUploading] = useState(false);

  // 3. Initialize Data (Edit Mode)
  useEffect(() => {
    if (isEditMode && product) {
      setName(product.name);
      setPrice(product.price);
      setDescription(product.description);
      setCategory(product.category);
      setCountInStock(product.countInStock);
      setSelectedSizes(product.availableSizes || []);
      setColors(product.colors && product.colors.length > 0 ? product.colors : [{ colorName: '', images: [] }]);
    }
  }, [product, isEditMode]);

  // 4. Image Upload Logic (Cloudinary Direct)
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
    return res.data.secure_url;
  };

  const handleImageUpload = async (e, colorIndex) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(files.map(uploadToCloudinary));
      
      const updatedColors = [...colors];
      updatedColors[colorIndex].images = [...updatedColors[colorIndex].images, ...uploadedUrls];
      setColors(updatedColors);
      
      toast.success("Images Uploaded!");
    } catch (err) { 
        console.error(err);
        toast.error("Upload failed!"); 
    } finally { 
        setUploading(false); 
    }
  };

  const setAsFront = (colorIndex, imgIndex) => {
    const updatedColors = [...colors];
    const imgs = [...updatedColors[colorIndex].images];
    const selectedImg = imgs.splice(imgIndex, 1)[0];
    imgs.unshift(selectedImg);
    updatedColors[colorIndex].images = imgs;
    setColors(updatedColors);
    toast.success("Thumbnail Updated!");
  };

  // 5. Helpers
  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const addColorBlock = () => setColors([...colors, { colorName: '', images: [] }]);
  
  const removeColorBlock = (index) => {
    if(colors.length === 1) return toast.error("At least one color is required!");
    setColors(colors.filter((_, i) => i !== index));
  };

  // 6. Submit Handler
  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!colors || colors[0].images.length === 0) return toast.error("Please upload at least one image!");
    if (!category) return toast.error("Please select a category!");

    const productData = {
        name,
        price: Number(price),
        description,
        category,
        brand: "none", // Brand removed placeholder
        countInStock: Number(countInStock),
        availableSizes: selectedSizes,
        colors, 
        image: colors[0].images[0] 
    };

    try {
      if (isEditMode) {
        await updateProduct({ productId, ...productData }).unwrap();
        toast.success('Product Updated');
      } else {
        // ✅ RTK Mutation Call
        await createProduct(productData).unwrap();
        toast.success('Product Created Successfully');
      }
      navigate('/admin/productlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Failed to save product");
    }
  };

  const isLoading = loadingProduct || loadingUpdate || loadingCreate || uploading;

  if (loadingProduct) return <Loader />;

  return (
    <div className="main-container fade-up" style={{ background: '#F0F8FF', padding: '40px 20px', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
       
       <style>{CSS_OVERRIDES}</style>

       {/* Header */}
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }} className="header-row-mobile">
         <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#002147', margin: 0 }}>
           {isEditMode ? "Update Product" : "Add New Product"}
         </h2>
         <button onClick={() => navigate('/admin/productlist')} style={STYLES.backBtn} className="back-btn back-btn-mobile">
           <i className="fa-solid fa-arrow-left"></i> Back
         </button>
       </div>

       <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }} className="form-wrapper-mobile">
         
         {/* ✅ Left Column: Product Info */}
         <div style={STYLES.leftCol} className="left-col-mobile">
           <h3 style={STYLES.sectionTitle}>Product Details</h3>
           
           <div style={{marginBottom: '15px'}}>
             <label style={STYLES.label}>Product Title</label>
             <input type="text" className="stylish-input" style={STYLES.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Football Jersey" required />
           </div>
           
           <div style={{marginBottom: '15px'}}>
             <label style={STYLES.label}>Description</label>
             <textarea className="stylish-input" style={{...STYLES.input, height: '100px', resize: 'none'}} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter details..." required />
           </div>
           
           <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }} className="price-stock-row">
             <div style={{flex: 1}}>
               <label style={STYLES.label}>Price (PKR)</label>
               <input type="number" className="stylish-input" style={STYLES.input} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" required />
             </div>
             <div style={{flex: 1}}>
               <label style={STYLES.label}>Stock</label>
               <input type="number" className="stylish-input" style={STYLES.input} value={countInStock} onChange={(e) => setCountInStock(e.target.value)} placeholder="0" required />
             </div>
           </div>
           
           <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{flex: 1}}>
                    <label style={STYLES.label}>Category</label>
                    <select className="stylish-input" style={STYLES.input} value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="" disabled>Select Category</option>
                        {categoriesData?.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                    </select>
                </div>
           </div>

           {/* ✅ Size Selector */}
           <div style={STYLES.sizeBox}>
             <p style={{ color: '#002147', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>Select Sizes:</p>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }} className="size-box-mobile">
               {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                 <div key={size} onClick={() => toggleSize(size)} 
                   className="size-hover"
                   style={{
                     ...STYLES.sizeBtn, 
                     backgroundColor: selectedSizes.includes(size) ? '#002147' : '#fff', 
                     color: selectedSizes.includes(size) ? '#fff' : '#002147', 
                     borderColor: selectedSizes.includes(size) ? '#002147' : '#ddd'
                   }}>
                   {size}
                 </div>
               ))}
             </div>
           </div>

           <button onClick={submitHandler} style={STYLES.publishBtn} className="publish-btn" disabled={isLoading}>
             {isLoading ? "Saving..." : (isEditMode ? "Update Product" : "Publish Product")}
           </button>
         </div>

         {/* ✅ Right Column: Media (Color + Images) */}
         <div style={STYLES.rightCol} className="right-col-mobile">
           <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}} className="color-header-mobile">
               <h3 style={STYLES.sectionTitle}>Product Media</h3>
               <button onClick={addColorBlock} style={STYLES.addVariantBtn} className="add-color-btn">+ Add Color</button>
           </div>
           
           {colors.map((c, idx) => (
             <div key={idx} style={STYLES.variantCard}>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{flex: 1, marginRight: '10px'}}>
                    <label style={STYLES.label}>Color Name</label>
                    <input type="text" className="stylish-input" style={{...STYLES.input, padding: '8px'}} value={c.colorName} onChange={(e) => {
                      const newCols = [...colors]; newCols[idx].colorName = e.target.value; setColors(newCols);
                    }} placeholder="e.g. Red" required />
                  </div>
                  {colors.length > 1 && <button onClick={() => removeColorBlock(idx)} style={STYLES.removeBtn}>Remove</button>}
               </div>

               <div style={STYLES.uploadArea}>
                  <input type="file" id={`file-${idx}`} multiple onChange={(e) => handleImageUpload(e, idx)} style={{display:'none'}} />
                  <label htmlFor={`file-${idx}`} style={STYLES.uploadLabel}>
                    <i className="fa-solid fa-cloud-arrow-up" style={{fontSize: '24px', marginBottom: '5px'}}></i>
                    <span>Click to Upload Images</span>
                  </label>
               </div>

               {/* ✅ Image Grid */}
               <div style={STYLES.previewGrid}>
                 {c.images.length === 0 && <p style={{fontSize:'13px', color:'#999', width:'100%', textAlign:'center'}}>No images yet.</p>}
                 
                 {c.images.map((img, i) => (
                   <div key={i} className="img-wrapper" style={{ 
                     ...STYLES.imgWrapper, 
                     border: i === 0 ? '3px solid #FF6F00' : '1px solid #eee', 
                     transform: i === 0 ? 'scale(1.02)' : 'none'
                   }}>
                     <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Product" />
                     
                     {i === 0 && (
                       <div style={STYLES.mainBadge} className="thumb-badge">
                         <i className="fa-solid fa-star" style={{marginRight: '4px'}}></i> Main
                       </div>
                     )}

                     {i !== 0 && (
                       <div style={STYLES.imgOverlay} className="overlay-btn">
                          <button type="button" onClick={() => setAsFront(idx, i)} style={STYLES.swapBtn}>Set as Main</button>
                       </div>
                     )}
                     
                     <button type="button" onClick={() => {
                         const nc = [...colors]; nc[idx].images.splice(i, 1); setColors(nc);
                     }} style={STYLES.delImgBtn}>×</button>
                   </div>
                 ))}
               </div>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
};

// ✅ STYLES OBJECT (Saare purane styles)
const STYLES = {
  leftCol: { flex: '1', background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: 'fit-content' },
  rightCol: { flex: '1.2', display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionTitle: { color: '#002147', fontSize: '18px', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', margin: 0 },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '5px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: '0.3s' },
  sizeBtn: { width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '13px', border: '1px solid', transition: 'all 0.3s ease' },
  uploadArea: { border: '2px dashed #FF6F00', borderRadius: '10px', background: '#fff9f0', textAlign: 'center', marginBottom: '15px', cursor: 'pointer', transition: '0.2s' },
  uploadLabel: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', cursor: 'pointer', color: '#FF6F00', fontWeight: '600' },
  variantCard: { background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
  addVariantBtn: { background: '#002147', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  removeBtn: { background: '#d32f2f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' },
  previewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' },
  imgWrapper: { position: 'relative', height: '110px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer' },
  imgOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' },
  mainBadge: { position: 'absolute', bottom: '0', left: '0', right: '0', background: '#FF6F00', color: '#fff', fontSize: '10px', textAlign: 'center', padding: '4px', fontWeight: 'bold' },
  swapBtn: { background: '#fff', color: '#002147', border: 'none', fontSize: '11px', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },
  delImgBtn: { position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 },
  publishBtn: { width: '100%', padding: '14px', background: '#FF6F00', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.3s', marginTop: '20px' },
  backBtn: { background: 'transparent', border: '2px solid #002147', color: '#002147', padding: '8px 20px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.3s' },
};

export default ProductEditScreen;