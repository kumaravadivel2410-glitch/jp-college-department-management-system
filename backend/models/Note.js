const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String, default: '' },
    semester: { type: String, default: '' },
    section: { type: String, default: '' },
    subjectCode: { type: String, default: '' },
    subjectName: { type: String, default: '' },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: 'pdf' }, // pdf, ppt, docx, zip, image
    fileName: { type: String, default: '' },
    fileSize: { type: String, default: '' },
    uploadedBy: { type: String, default: '' },
    uploaderEmail: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', NoteSchema);
