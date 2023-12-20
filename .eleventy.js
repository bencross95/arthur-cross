const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/style.css");
  eleventyConfig.addPassthroughCopy("./src/assets/");
  eleventyConfig.addPassthroughCopy("./src/animation.js");
  eleventyConfig.addPassthroughCopy("./src/main.js");
  eleventyConfig.addPassthroughCopy("./src/admin");
  eleventyConfig.addPassthroughCopy('node_modules/lil-gui');

  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  })

  return {
    dir: {
      input: 'src', // or whatever your source directory is
      output: 'public', // or whatever your output directory is
    },
  };
};



