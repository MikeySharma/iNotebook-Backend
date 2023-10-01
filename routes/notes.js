const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

//ROUTE 1: Get all the notes using: GET "/api/notes/fetchallnotes" Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
})

//ROUTE 2: Add a new notes using: POST"/api/notes/addnote" Login required
router.post('/addnotes', fetchuser, [
    body('title', "Enter a valid title").isLength({ min: 3 }),
    body('description', "Description must be at least 5 characters").isLength({ min: 5 })
], async (req, res) => {

    try {
        const { title, description, tag } = req.body;
        //If there are errors return bad request and errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();
        res.json(savedNote)
    } catch (error) {

        console.error(error.message)
        res.status(500).send('Internal server error occured');
    }
})

//ROUTE 3: update an existing notes using: PUT"/api/notes/updatenotes" Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    //Create a newNote object
    try {
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //Find the note to be updated update
        let note = await Note.findById(req.params.id);
        if (!note) { res.status(404).send("Not Found") };

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note });
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error occured');
    }
})
//ROUTE 4: Delete an existing notes using: POST"/api/notes/deletenote" Login required

router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        
        //Find the note to be deleted and delete 
        let note = await Note.findById(req.params.id);
        if (!note) { res.status(404).send("Not Found") };

        //Allow deletion if only users own it
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note has been deleted successfully.", note: note });
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error occured');
    }
})

module.exports = router