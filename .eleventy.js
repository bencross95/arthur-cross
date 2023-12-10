module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/style.css");

  return {
    dir: {
      input: 'src', // or whatever your source directory is
      output: 'public', // or whatever your output directory is
    },
  };
};