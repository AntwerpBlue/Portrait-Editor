import React from 'react'

const ResultPage = () => {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Contact Us</h1>
        <p>Thank you for your interest in our company. Please reach out to us using the following contact information:</p>
        <div style={{ margin: '2rem 0' }}>
          <h2>Phone:</h2>
          <p>+123 456 7890</p>
        </div>
        <div style={{ margin: '2rem 0' }}>
          <h2>Email:</h2>
          <p>contact@yourcompany.com</p>
        </div>
        <div style={{ margin: '2rem 0' }}>
          <h2>Address:</h2>
          <p>123 Your Street, Your City, Your State, Your Country</p>
        </div>
        <div>
          <h2>Social Media:</h2>
          <p>
            Follow us on:
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>, 
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>, 
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          </p>
        </div>
      </div>
    );
  };
  
  export default ResultPage;