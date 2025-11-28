import React from 'react';
import {  Send } from 'lucide-react';

const Contact = () => {
  return (
    <div className="page-container" style={{ justifyContent: 'center' }}>
      <div className="hero-card" style={{ maxWidth: '600px' }}>
        <h1 style={{ color: '#ff80ab', marginBottom: '10px' }}>Contact Us</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Have questions or feedback? Send us a message!
        </p>

        {/* Connected to your Formspree Endpoint */}
        <form 
          action="https://formspree.io/f/mnnkowwz" 
          method="POST"
          style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}
        >
          {/* Custom Subject Line for the email you receive */}
          <input type="hidden" name="_subject" value="New Message from SnapBunny App!" />

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Name</label>
            <input 
              type="text" 
              name="name" 
              required 
              style={{ 
                width: '100%', padding: '12px', borderRadius: '10px', 
                border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box',
                outline: 'none', transition: 'border 0.3s'
              }} 
              placeholder="Your Name"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              style={{ 
                width: '100%', padding: '12px', borderRadius: '10px', 
                border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box',
                outline: 'none'
              }} 
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Message</label>
            <textarea 
              name="message" 
              rows="5" 
              required 
              style={{ 
                width: '100%', padding: '12px', borderRadius: '10px', 
                border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box',
                fontFamily: 'Quicksand', outline: 'none'
              }} 
              placeholder="Write your message here..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="btn-bunny" 
            style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <Send size={18} /> Send Message
          </button>
        </form>

        <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#888' }}>
           
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;