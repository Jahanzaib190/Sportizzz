const asyncHandler = require('../middleware/asyncHandler');
const Banner = require('../models/bannerModel');

// @desc    Fetch all banners
// @route   GET /api/banners
// @access  Public
const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({});
  res.json(banners);
});

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = asyncHandler(async (req, res) => {
  const { image, title, link } = req.body;

  const banner = new Banner({
    image,
    title,
    link,
  });

  const createdBanner = await banner.save();
  res.status(201).json(createdBanner);
});

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (banner) {
    await Banner.deleteOne({ _id: banner._id });
    res.json({ message: 'Banner removed' });
  } else {
    res.status(404);
    throw new Error('Banner not found');
  }
});

module.exports = {
  getBanners,
  createBanner,
  deleteBanner,
};