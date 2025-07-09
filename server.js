const mobilenet = require('@tensorflow-models/mobilenet');
const tf = require('@tensorflow/tfjs-node');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

app.post('/upload', upload.single('image'), async (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.file.filename);
  const imageBuffer = fs.readFileSync(filePath);
  const imageTensor = tf.node.decodeImage(imageBuffer);

  const model = await mobilenet.load();
  const predictions = await model.classify(imageTensor);
  const topPrediction = predictions[0]?.className.toLowerCase() || 'uncategorized';

  // Match to known categories
  const knownCategories = ['boat', 'car', 'house'];
  let finalCategory = knownCategories.find(c => topPrediction.includes(c)) || 'uncategorized';

  const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  const entry = {
    filename: req.file.filename,
    category: finalCategory,
    imageUrl
  };

  // Save metadata
  const metadata = getMetadata();
  metadata.push(entry);
  saveMetadata(metadata);

  res.json(entry);
});
