const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String, // Optional: In case you want to write text on the slider
      required: false,
    },
    link: {
      type: String, // Optional: If you want the banner to click to a specific product
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;