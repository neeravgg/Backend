const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/security");

const Note = require("../models/notes");

//@desc         Show add Page
//@route        GET/Notes/add
router.get("/add", ensureAuth, (req, res) => {
  res.render("notes/add");
});

//@desc         Process add form
//@route        POST  /stories
router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Note.create(req.body);
    res.redirect("/dashboard");
  } 
  
  catch (err) {
    console.error(err);
    res.render("error/500");
  }
});


//@desc         Show all Notes
//@route        GET /Notes
router.get("/", ensureAuth, async(req, res) => {
  try{
    const notes = await Note.find({status: 'public'})
    .populate('user')
    .sort({createdAt: 'desc'})
    .lean()
    res.render('notes/index',{
      notes,
    })
  }
  catch(err) {
    console.error(err)
    res.render('error/500')
  }
});

//@desc         Show Single Note
//@route        GET/Notes/:id
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id)
    .populate('user')
    .lean()

    if(!note){
      return res.render('error/404')
    }
    res.render('notes/show', {
      note
    })

  } catch (error) {
    console.error(err)  
    res.render('error/404')
  }
});

//@desc         Show  edit Page
//@route        GET   /Notes/edit/:id
router.get("/edit/:id", ensureAuth, async(req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id
    }).lean()
  
    if(!note){
      return res.render('error/404')
  
    }
  
    if(note.user != req.user.id)   {
      req.redirect('/notes')
    }
    else{
      res.render('notes/edit',{
        note,
      })
    }
  } catch (err) {
    console.error(err)
      return res.render('error/500')
    
  }
});

//@desc         Update note
//@route        PUT  /stories/:id
router.put("/:id", ensureAuth, async(req, res) => {
try {
  let note = await Note.findById(req.params.id).lean

  if(!note){
      return res.render('error/404')
  }

  if(note.user != req.user.id){
    res.redirect('/notes')
  }
  else{
    note = await Note.findOneAndUpdate({_id: req.params.id}, req.body,{
      new: true,
      runValidators: true
    })
    res.redirect('/dashboard')
  }
} catch (err) {
  console.error(err)
    return res.render('error/500')
  
}
  
});

//@desc         Delete note
//@route        DELETE  /notes/:id
router.delete("/:id", ensureAuth, async(req, res) => {
  try{
    
      await Note.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    
  }
  catch(err) {
    console.error(err)
      return res.render('error/500')
    
  }
});

//@desc         User notes
//@route        GET/notes/user/:userid
router.get("/user/:userId", ensureAuth, async(req, res) => {
 
  try {
    const notes = await Note.find({
      user: req.params.userId,
      status : 'public'
    })
    .populate('user')
    .lean()
    res.render('notes/index', {
      notes,
    })
  } catch (error) {
    console.error(err)
    res.render('error/500')
  }
});

module.exports = router;
