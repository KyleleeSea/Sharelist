// Contact setup
const nodemailer = require('nodemailer');

module.exports.renderContact = (req, res) => {
    res.render('contact')
};

module.exports.postContact = (req, res) => {
    console.log(req.body)
    // Email Template
    const output = `
          <h3>Contact Details</h3>
          <p>Name: ${req.body.name}</p>
          <p>Email: ${req.body.email}</p>
          <P>Subject: ${req.body.subject}</p>
          <h3>Message</h3>
          <p>${req.body.message}</p>
      `;

    // Instantiate the SMTP server
    const smtpTrans = nodemailer.createTransport({
        host: 'mail.sharelist.org',
        port: 465,
        secure: true,
        auth: {
            user: "contact@sharelist.org", // Sender email username
            pass: process.env.EMAIL_PASSWORD, // Sender email password, not the normal one.
        }
    })

    // Specify what the email will look like
    const mailOpts = {
        from: '"Contact Form" <contact@Sharelist.com>', //Sender mail
        to: "contact@sharelist.org",					// Recever mail
        subject: `${req.body.name}`,
        html: output
    }

    // Send mail with defined transport object
    smtpTrans.sendMail(mailOpts, (error, info) => {
        if (error) {
            req.flash('error', 'Something went wrong when sending, please try again.');
            return res.redirect(`/contact`);
        }
        req.flash('success', `Thank you for contacting us, we recieved your message!`);
        return res.redirect(`/contact`);
    });

}

// Featured contact form

module.exports.renderFeatureContact = (req, res) => {
    res.render('featurecontact')
};

module.exports.postFeatureContact = (req, res) => {
    // Email Template
    const output = `
        <h3>Contact Details</h3>
        <p>Name: ${req.body.name}</p>
        <p>Email: ${req.body.email}</p>
        <P>Subject: ${req.body.subject}</p>
        <h3>Message</h3>
        <p>${req.body.message}</p>
    `;

    // Instantiate the SMTP server
    const smtpTrans = nodemailer.createTransport({
        host: 'mail.sharelist.org',
        port: 465,
        secure: true,
        auth: {
            user: "feature@sharelist.org", // Sender email username
            pass: process.env.EMAIL_PASSWORD, // Sender email password, not the normal one.
        }
    })

    // Specify what the email will look like
    const mailOpts = {
        from: '"Feature Form" <feature@Sharelist.com>', //Sender mail
        to: "feature@sharelist.org",					// Recever mail
        subject: `${req.body.name}`,
        html: output
    }

    // Send mail with defined transport object
    smtpTrans.sendMail(mailOpts, (error, info) => {
        if (error) {
            req.flash('error', 'Something went wrong when sending, please try again.');
            return res.redirect(`/featurecontact`);
        }
        req.flash('success', `Thank you for contacting us, we recieved your message!`);
        return res.redirect(`/featurecontact`);
    });
}