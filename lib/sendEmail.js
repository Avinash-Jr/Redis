const sendEmail = async (email) => {
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`Email sent to ${email} successfully!`);
            resolve();
        }, 5000);
    });
};

export default sendEmail;