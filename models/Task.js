const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  body: {
    type: String,
    required: true
  }
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
