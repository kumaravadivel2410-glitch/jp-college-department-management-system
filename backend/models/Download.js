import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'Syllabus'
    },
    fileSize: {
      type: String,
      default: '1.2 MB'
    },
    fileType: {
      type: String,
      default: 'PDF'
    },
    downloadUrl: {
      type: String,
      default: '#'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Download || mongoose.model('Download', downloadSchema);
