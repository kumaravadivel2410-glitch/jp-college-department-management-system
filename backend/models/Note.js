import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subjectCode: {
      type: String,
      required: true
    },
    subjectName: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      required: true
    },
    unitNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    uploadedBy: {
      type: String,
      default: 'Faculty'
    },
    fileUrl: {
      type: String,
      default: ''
    },
    fileType: {
      type: String,
      default: 'PDF'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model('Note', noteSchema);
