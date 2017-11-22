import node from "rollup-plugin-node-resolve";

export default {
  input: "custom-d3.js",
  output: {
    file: "d3.js",
    format: "umd",
    name: "d3",
  },
  plugins: [node()]
};
