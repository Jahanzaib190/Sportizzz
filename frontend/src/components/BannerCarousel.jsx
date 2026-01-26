import { Link } from 'react-router-dom';
import { Carousel, Image } from 'react-bootstrap';
import Loader from './Loader';
import Message from './Message';
import { useGetBannersQuery } from '../slices/bannersApiSlice';

const BannerCarousel = () => {
  const { data: banners, isLoading, error } = useGetBannersQuery();

  if (isLoading) return null; // Don't show anything if loading (looks cleaner)
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  if (banners && banners.length === 0) {
      return null; // Don't show empty slider
  }

  return (
    <Carousel pause='hover' className='bg-slate-800 mb-8 rounded-xl overflow-hidden shadow-2xl'>
      {banners.map((banner) => (
        <Carousel.Item key={banner._id} interval={3000}>
            {/* If there is a link, make the image clickable. If not, just show image */}
            {banner.link ? (
                <Link to={banner.link}>
                    <Image 
                        src={banner.image} 
                        alt={banner.title} 
                        fluid 
                        className="d-block w-100 object-cover h-[300px] md:h-[400px]"
                    />
                    {banner.title && (
                        <Carousel.Caption className='bg-black bg-opacity-50 rounded p-2 absolute bottom-0'>
                            <h2 className='text-white text-xl md:text-2xl font-bold m-0'>{banner.title}</h2>
                        </Carousel.Caption>
                    )}
                </Link>
            ) : (
                <>
                    <Image 
                        src={banner.image} 
                        alt={banner.title} 
                        fluid 
                        className="d-block w-100 object-cover h-[300px] md:h-[400px]"
                    />
                    {banner.title && (
                        <Carousel.Caption className='bg-black bg-opacity-50 rounded p-2 absolute bottom-0'>
                            <h2 className='text-white text-xl md:text-2xl font-bold m-0'>{banner.title}</h2>
                        </Carousel.Caption>
                    )}
                </>
            )}
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default BannerCarousel;