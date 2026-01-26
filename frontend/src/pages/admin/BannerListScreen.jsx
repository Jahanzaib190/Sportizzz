import { useState } from 'react';
import { useGetBannersQuery, useCreateBannerMutation, useDeleteBannerMutation, useUploadBannerImageMutation } from '../../slices/bannersApiSlice';
import { FaTrash, FaCloudUploadAlt, FaLink, FaHeading } from 'react-icons/fa';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { toast } from 'react-toastify';

const CSS_OVERRIDES = `
  .banner-wrapper { background: white; padding: 30px; border-radius: 16px; border: 1px solid #e1e4e8; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
  .stylish-input { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; transition: 0.2s; background: #fff; color: #333; }
  .stylish-input:focus { border-color: #FF6F00; box-shadow: 0 0 0 3px rgba(255, 111, 0, 0.1); }
  
  .add-btn { width: 100%; padding: 14px; background: #FF6F00; color: #fff; border: none; border-radius: 50px; font-weight: bold; font-size: 15px; cursor: pointer; transition: 0.3s; margin-top: 10px; }
  .add-btn:hover:not(:disabled) { background: #e65c00; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(230, 92, 0, 0.3); }
  
  /* Banner Card */
  .banner-card { position: relative; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.04); transition: 0.3s; }
  .banner-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
  
  /* ✅ FIXED: Professional Floating Delete Button */
  .delete-overlay-btn { 
    position: absolute; 
    top: 10px; 
    right: 10px; 
    width: 36px; 
    height: 36px; 
    background: #dc2626; /* Red Color */
    color: white; 
    border: none; 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    cursor: pointer; 
    opacity: 0; /* Hidden by default */
    transition: all 0.3s ease; 
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    z-index: 10;
  }
  
  /* Show on Hover */
  .banner-card:hover .delete-overlay-btn { 
    opacity: 1; 
    transform: scale(1.1); 
  }
  
  .delete-overlay-btn:hover { 
    background: #b91c1c; /* Darker Red */
    transform: scale(1.2) !important;
  }

  .file-upload-box { border: 2px dashed #ddd; padding: 20px; text-align: center; border-radius: 8px; cursor: pointer; transition: 0.2s; background: #f9f9f9; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
  .file-upload-box:hover { border-color: #FF6F00; background: #fffbf5; }
`;

const BannerListScreen = () => {
  const { data: banners, isLoading, error, refetch } = useGetBannersQuery();
  const [createBanner, { isLoading: loadingCreate }] = useCreateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();
  const [uploadBannerImage, { isLoading: loadingUpload }] = useUploadBannerImageMutation();

  const [image, setImage] = useState('');
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadBannerImage(formData).unwrap();
      toast.success('Image Uploaded');
      setImage(res.image); 
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!image) return toast.error("Please upload an image");
    try {
      await createBanner({ image, title, link }).unwrap();
      toast.success('Banner Added');
      setImage('');
      setTitle('');
      setLink('');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner(id).unwrap();
        toast.success('Banner Deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <div style={{ background: '#f4f7f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Poppins', sans-serif" }}>
      <style>{CSS_OVERRIDES}</style>
      
      <div className="main-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#002147', margin: '0 0 5px 0' }}>Manage Banners</h1>
            <p style={{ color: '#565959', fontSize: '14px', marginTop: '5px' }}>Control the home page slider images</p>
        </div>

        {/* UPLOAD FORM */}
        <div className="banner-wrapper fade-up">
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#002147', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            Add New Banner
          </h2>
          
          <form onSubmit={submitHandler}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
              
              {/* Left: Image Upload Area */}
              <div>
                <input id="bannerInput" type="file" onChange={uploadFileHandler} style={{ display: 'none' }} />
                <div className="file-upload-box" onClick={() => document.getElementById('bannerInput').click()}>
                    {image ? (
                        <img src={image} alt="Preview" style={{width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px'}} />
                    ) : (
                        <>
                            <FaCloudUploadAlt style={{ fontSize: '30px', color: '#FF6F00', marginBottom: '10px' }} />
                            <p style={{ margin: 0, fontSize: '13px', color: '#666', fontWeight: '600' }}>Click to upload</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#999' }}>JPG, PNG supported</p>
                        </>
                    )}
                    {loadingUpload && <Loader />}
                </div>
              </div>

              {/* Right: Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{position: 'relative'}}>
                    <FaHeading style={{position: 'absolute', top: '14px', left: '15px', color: '#aaa'}} />
                    <input type="text" placeholder="Banner Title (Optional)" value={title} onChange={(e) => setTitle(e.target.value)} className="stylish-input" style={{paddingLeft: '40px'}} />
                  </div>
                  <div style={{position: 'relative'}}>
                    <FaLink style={{position: 'absolute', top: '14px', left: '15px', color: '#aaa'}} />
                    <input type="text" placeholder="Link URL (Optional)" value={link} onChange={(e) => setLink(e.target.value)} className="stylish-input" style={{paddingLeft: '40px'}} />
                  </div>
                  
                  <button type="submit" className="add-btn" disabled={loadingCreate}>
                    {loadingCreate ? 'Processing...' : '+ Add Banner'}
                  </button>
              </div>
            </div>
          </form>
        </div>

        {/* BANNERS LIST */}
        <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#002147', marginBottom: '20px' }}>Active Banners</h3>
            
            {isLoading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error?.data?.message || error.error}</Message>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                {banners.map((banner) => (
                    <div key={banner._id} className="banner-card">
                        
                        {/* ✅ HOVER DELETE BUTTON */}
                        <button onClick={() => deleteHandler(banner._id)} className="delete-overlay-btn" title="Delete Banner">
                            <FaTrash size={14} />
                        </button>

                        <div style={{ height: '160px', background: '#f0f0f0', borderBottom: '1px solid #eee' }}>
                            <img src={banner.image} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        
                        {(banner.title || banner.link) && (
                            <div style={{ padding: '15px' }}>
                                {banner.title && <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#002147', fontWeight: '700' }}>{banner.title}</h3>}
                                {banner.link && (
                                    <p style={{ margin: 0, fontSize: '12px', color: '#007185', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <FaLink /> {banner.link}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                </div>
            )}
            
            {banners && banners.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    <p>No banners active.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default BannerListScreen;