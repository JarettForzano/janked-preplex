export default {
entry: {
    main: './src/index.ts',
    recorderWorkletProcessor: './src/api/recorderWorkletProcessor.ts',
},
output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
},
};