import multer from 'multer'; 
import express from "express"
const storage = multer.memoryStorage();
export const uploadFormData = multer({ storage });
