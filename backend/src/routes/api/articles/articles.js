import express from "express";
import multer from "multer";
import { v4 as uuid } from 'uuid'; //uuid
import fs from "fs";

import { getArticles, getArticlesByTag, getArticleById, getTop5Article, getRecentArticle,softDeleteArticle, insertArticle, updateArticle } from "../../../data/articles/articles-dao.js"; 
import { getLike, likeArticle, deleteLike,hasUserLikedArticle } from "../../../data/articles/likes-dao.js";
import {addArticleTags, updateArticleTags} from "../../../data/articles/tags/tags-dao.js";
import {insertArticleImage, getArticleImages} from "../../../data/articles/image-dao.js";
import { deleteArticleImage } from  "../../../data/articles/image-dao.js";
import { notifySubscribersOnNewArticle } from "../../../data/users/notification/notification-dao.js";



const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

const router = express.Router();




router.get("/", async (req, res) => {
  try {
    const { tag } = req.query;

    if (tag) {
      // If tag, fetch articles by tag
      const normalizedTag = tag.trim().toLowerCase();
      const articles = await getArticlesByTag(tag);
      return res.json(articles);
    }

    //or fetch all articles
    const articles = await getArticles();
    res.json(articles);

  } catch (err) {
    console.error("Failed to get articles:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




  router.post('/', async (req, res) => {
    try {
      const { title, content, tags } = req.body;
  
      const user_id = req.user?.userId;
  
      if (!user_id || !title || !content) {
        return res.status(400).json({ error: 'user_id, title and content are required.' });
      }
      
      const newArticle = await insertArticle({ user_id, title, content });
      const articleId = newArticle.article_id;

      if(tags.length > 0){
        const newTags = await addArticleTags(articleId, tags);
      }

      notifySubscribersOnNewArticle(user_id, articleId);

      res.status(201).json(newArticle);
  
    } catch (error) {
      console.error('Error inserting article:', error);
      res.status(500).json({ error: 'Failed to insert article.' });
    }
  });



  router.get("/me", async (req, res) => {
    
    const userId = req.user.userId  
    

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  
    try {
      const articles = await getArticles(userId);
      res.json(articles);
    } catch (err) {
      console.error("Failed to get user's articles:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  




  router.get("/most-liked-top-5", async (req, res) => {
    try {
      const articles = await getTop5Article();
      res.json(articles);
    } catch (err) {
      console.error("Error in /most-liked-top-5:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/latest-top-5", async (req, res) => {
    try {
      const articles = await getRecentArticle();
      res.json(articles);
    } catch (err) {
      console.error("Error in /latest-top-5:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


router.post("/images", upload.single("image-file"), async (req, res) => {
  
  try{
    const originalname = req.file.originalname; 
    const fileExtension = originalname.substring(originalname.lastIndexOf("."));
    const newFileName = uuid() + fileExtension;

    const imageUrl_ = `/images/uploads/${newFileName}`;
    fs.renameSync(req.file.path, `public${imageUrl_}`);


    
    const imageUrl =  `http://localhost:3000/uploads/${newFileName}`;
    


    res.json({ location:  imageUrl });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ status: "error", message: "Image upload failed" });
  }
});


  
  router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const deleted = await softDeleteArticle(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Article not found or already deleted.' });
      }
      res.status(200).json({ message: 'Article soft deleted.' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete article.' });
    }
  });
  
  
  router.get("/:id", async (req, res) => {
    try {
      const articleId = req.params.id;
      const article = await getArticleById(articleId);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (err) {
      console.error("Failed to get article:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });



  router.patch('/:id', async (req, res) => {
    try {
      const { title, content, tags } = req.body;
      const articleId = req.params.id; 
  
      if (!articleId || !title || !content) {
        return res.status(400).json({ error: 'articleId, title and content are required.' });
      }
  
      const newArticle = await updateArticle({ articleId, title, content });
      
      if(tags.length > 0){
        const updateTags = await updateArticleTags(articleId, tags);
      }
      
  
      res.status(200).json(newArticle); 
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ error: 'Failed to update article.' });
    }
  });
  

  router.get("/:id/likes", async (req, res) => {
    try {
      const articleId = req.params.id;
      const like = await getLike(articleId);
  
      // Return 0 if there are no likes
      const likeCount = like ?? 0;  
  
      return res.status(200).json({ likes: likeCount });
    } catch (error) {
      console.error("Failed to get likes:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  });
  
 

  router.post("/:id/like", async (req, res) => {
    const articleId = req.params.id;
    const userId = req.user.userId;
    const { liked } = req.body;

    console.log("Incoming like request, req.user:", req.user);

    try {
      if (liked) {
        await likeArticle(articleId, userId );
      } else {
        await deleteLike(articleId, userId);
      }
  
      const likeCount = await getLike(articleId);
  
      return res.status(200).json({ like_cnt: likeCount });
    } catch (error) {
      console.error("Error updating like:", error.message);
      return res.status(500).json({ error: "Failed to update like." });
    }
  });
  
  router.get("/:id/liked", async (req, res) => {
    const articleId = req.params.id;
    const userId = req.user.userId;
  
    try {
      const liked = await hasUserLikedArticle( articleId, userId);
      res.json({ liked });
    } catch (error) {
      console.error('Failed to get like status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


router.post("/:id/images", upload.single("image-file"), async (req, res) => {
  
  try{
    const article_id = req.params.id;
    const originalname = req.file.originalname; 
    const fileExtension = originalname.substring(originalname.lastIndexOf("."));
    const newFileName = uuid() + fileExtension;

    const imageUrl = `/images/uploads/${newFileName}`;
    fs.renameSync(req.file.path, `public${imageUrl}`);


    
    const imageUrl_db = `/uploads/${newFileName}`;
    const insertedImage = await insertArticleImage(article_id, imageUrl_db);


    res.json({
      status: "success",
      data: insertedImage
            });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ status: "error", message: "Image upload failed" });
  }
});




router.get("/:id/images", async (req, res) => {
  const articleId = req.params.id;

  if (isNaN(articleId)) {
    return res.status(400).json({ error: "Invalid article ID" });
  }

  try {
    const images = await getArticleImages(articleId);

    return res.json({
      status: "success",
      data: images
    });
  } catch (err) {
    console.error("Error fetching article images:", err);
    return res.status(500).json({ error: "Failed to retrieve images" });
  }
});


router.delete('/:articleId/images/:imageId', async (req, res) => {
  const { articleId, imageId } = req.params;
  console.log({ articleId, imageId });

  try {
    const result = await deleteArticleImage(articleId, imageId);

    if (!result.success) {
      return res.status(404).json({ status: 'error', message: 'Image not found' });
    }

    res.json({ status: 'success', message: 'Image deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});


  
export default router;

