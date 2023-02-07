const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.set('strictQuery',false)
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017', { useNewUrlParser: true });

// Todo Schema
const TodoSchema = new mongoose.Schema({
  task: { type: String, required: true },
  priority: { type: Number, required: true },
  status: { type: String, required: true }
});

// Model
const Todo = mongoose.model('Todo', TodoSchema);

// Middleware for authentication
const checkAuth = (req, res, next) => {
  if (req.headers.authorization === 'secretkey') {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

// Route for creating task
app.post('/todos', checkAuth, (req, res) => {
  const todo = new Todo({
    task: req.body.task,
    priority: req.body.priority,
    status: 'pending'
  });

  todo.save().then(todo => {
    res.status(200).send(todo);
  });
});

// Route for listing tasks
app.get('/todos', checkAuth, (req, res) => {
  Todo.find({}).then(todos => {
    res.status(200).send(todos);
  });
});

// Route for marking task as completed
app.put('/todos/:id', checkAuth, (req, res) => {
  Todo.findByIdAndUpdate(req.params.id, { status: 'completed' }).then(todo => {
    res.status(200).send(todo);
  });
});

// Route for marking task as cancelled
app.put('/todos/:id', checkAuth, (req, res) => {
  Todo.findByIdAndUpdate(req.params.id, { status: 'cancelled' }).then(todo => {
    res.status(200).send(todo);
  });
});

// Route for deleting task
app.delete('/todos/:id', checkAuth, (req, res) => {
  Todo.findByIdAndRemove(req.params.id).then(todo => {
    res.status(200).send(todo);
  });
});

// Route for task report
app.get('/todos/report', checkAuth, (req, res) => {
  Todo.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]).then(report => {
    res.status(200).
    send(report);
  });
  });
  
  app.listen(3000, () => {
  console.log('To-Do List API started on port 3000');
  });