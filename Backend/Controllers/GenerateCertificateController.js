
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { Course } = require('../Models/CourseModel');
const catchAsyncError = require('../Middlewares/catchAsyncError');
const { ErrorHandler } = require('../Middlewares/errorsmiddleware');
const path = require('path');
const { mongoose } = require('mongoose');

// Certificate Generation API


const generateCertificate = catchAsyncError(async (req, res, next) => {
    const { courseId } = req.params;
    const userId = req.user._id;
  
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }
  
    const certificate = await course.generateCertificate(userId);
    console.log("Course Certificate:", certificate);
  
    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
      margin: 60,
    });
  
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${certificate.certificateId}.pdf`
    );
  
    doc.pipe(res);
  
    // Background image
    const imagePath = path.join(
      __dirname,
      "../public/certificates/CertificateBG.jpg"
    );
  
    if (!fs.existsSync(imagePath)) {
      console.error("Certificate background image not found at:", imagePath);
      return next(new ErrorHandler("Certificate template missing", 500));
    }
  
    doc.image(imagePath, 0, 0, { width: 842 });
  
    // Styling the Certificate
    doc
      .fillColor("#222222")
      .font("Helvetica-Bold")
      .fontSize(38)
      .text("Certificate of Completion", 60 , 100, {
        align: "center",
        underline: true,
      })
      .moveDown(1.2);
  
    doc
      .font("Helvetica")
      .fontSize(20)
      .text("This certificate is proudly presented to", {
        align: "center",
      })
      .moveDown(1);
  
    // Student Name - Highlighted
    doc
      .font("Helvetica-Bold")
      .fontSize(32)
      .fillColor("#0055A4")
      .text(certificate.studentName, {
        align: "center",
      })
      .moveDown(0.8);
  
    // Course Title
    doc
      .font("Helvetica")
      .fontSize(18)
      .fillColor("#222222")
      .text(
        `For successfully completing the course "${certificate.courseTitle}"`,
        {
          align: "center",
        }
      )
      .moveDown(1);
  
    // Score
    doc
      .fontSize(16)
      .fillColor("#333333")
      .text(`With a score of ${certificate.quizScore}%`, {
        align: "center",
      })
      .moveDown(2);
  
    // Footer Section
    doc
      .font("Helvetica")
      .fontSize(14)
      .fillColor("#000000")
      .text(
        `Date of Completion: ${certificate.completionDate.toLocaleDateString()}`,
        330,
        390
      )
      .text(`Certificate ID: ${certificate.certificateId}`, 533, 60);
  
    // Signature line
    doc
      .fontSize(14)
      .text("Instructor Signature", 80, 500)
      .text("Director Signature", 600, 500);
  
    doc.end();
  });  



  


// download certificate API     

const downloadCertificate = catchAsyncError(async (req, res, next) => {
    const { certificateId } = req.params;
    const userId = req.user._id;
   
    // Find course with this certificate
    const course = await Course.findOne({
        'students.user': userId,
        'students.certificate.certificateId': certificateId
    });

    if (!course) {
        return next(new ErrorHandler('Certificate not found', 404));
    }

    const enrollment = course.students.find(s => 
        s.user.equals(userId) && 
        s.certificate?.certificateId === certificateId
    );

    if (!enrollment) {
        return next(new ErrorHandler('Certificate not found', 404));
    }

    // Generate the certificate data
    const certificate = await course.generateCertificate(userId);

    // Create PDF document
    const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margin: 60,
    });

    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', `attachment; filename="certificate-${certificateId}.pdf"`);
    res.header('Access-Control-Expose-Headers', 'Content-Disposition');



    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Rest of your PDF generation code...
    const imagePath = path.join(
        __dirname,
        "../public/certificates/CertificateBG.jpg"
    );

    if (fs.existsSync(imagePath)) {
        doc.image(imagePath, 0, 0, { width: 842 });
    }

    console.log('Adding certificate title to PDF');
    // Certificate content
    doc.fillColor("#222222")
       .font("Helvetica-Bold")
       .fontSize(38)
       .text("Certificate of Completion", 60, 100, {
           align: "center",
           underline: true,
       })
       .moveDown(1.2);

    doc.font("Helvetica")
       .fontSize(20)
       .text("This certificate is proudly presented to", {
           align: "center",
       })
       .moveDown(1);

    // Student Name
    doc.font("Helvetica-Bold")
       .fontSize(32)
       .fillColor("#0055A4")
       .text(certificate.studentName, {
           align: "center",
       })
       .moveDown(0.8);

    // Course Title
    doc.font("Helvetica")
       .fontSize(18)
       .fillColor("#222222")
       .text(
           `For successfully completing the course "${certificate.courseTitle}"`,
           {
               align: "center",
           }
       )
       .moveDown(1);

    // Score
    doc.fontSize(16)
       .fillColor("#333333")
       .text(`With a score of ${certificate.quizScore}%`, {
           align: "center",
       })
       .moveDown(2);

    // Footer
    doc.font("Helvetica")
       .fontSize(14)
       .fillColor("#000000")
       .text(
           `Date of Completion: ${new Date(certificate.completionDate).toLocaleDateString()}`,
           330,
           390
       )
       .text(`Certificate ID: ${certificate.certificateId}`, 533, 60);

    // Signature lines
    doc.fontSize(14)
       .text("Instructor Signature", 80, 500)
       .text("Director Signature", 600, 500);


       doc.on('error', (err) => {
        console.error('PDF Generation Error:', err);
        return next(new ErrorHandler('Failed to generate PDF', 500));
    })

    doc.end();
});



module.exports = {generateCertificate , downloadCertificate}