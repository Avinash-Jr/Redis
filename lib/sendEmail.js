const sendEmail = async () => {
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("Email sent successfully!");
            resolve();
        }, 5000);
    });
};

export default sendEmail;