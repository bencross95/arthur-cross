module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/style.css");
  eleventyConfig.addPassthroughCopy("./sec/assets")

  return {
    dir: {
      input: 'src', // or whatever your source directory is
      output: 'public', // or whatever your output directory is
    },
  };
};