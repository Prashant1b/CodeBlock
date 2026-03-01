const express=require('express');
const usermiddleware=require('../middleware/usermiddleware');
const {
  AllDiscussion,
  GetDiscussionById,
  CreateDiscussion,
  UpdateDiscussion,
  DeleteDiscussion,
  ToggleDiscussionLike,
  AddDiscussionComment,
  DeleteDiscussionComment,
}=require('../Controller/discussion');
const adminmiddleware = require('../middleware/adminmiddleware');

const router=express.Router();

router.get('/alldiscussion',usermiddleware,AllDiscussion);
router.get('/:id',usermiddleware,GetDiscussionById);
router.post('/creatediscussion',usermiddleware,CreateDiscussion);
router.put('/updatediscussion/:id',usermiddleware,UpdateDiscussion);
router.delete('/deletedicussion/:id',usermiddleware,DeleteDiscussion);
router.patch('/:id/like',usermiddleware,ToggleDiscussionLike);
router.post('/:id/comment',usermiddleware,AddDiscussionComment);
router.delete('/:id/comment/:commentId',adminmiddleware,DeleteDiscussionComment);

module.exports=router;
