'use client';

import { useState } from 'react';

export default function TermsAndConditions() {
  const [showModal, setShowModal] = useState(true);
  
  const handleClose = () => {
    setShowModal(false);
    window.history.back();
  };
  
  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
          <div 
            className="bg-white rounded-lg p-4 max-w-2xl w-full mx-4 relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-[80vh] overflow-y-auto p-2">
              <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                <p className="mb-2">Welcome to Fanfie ("we," "our," or "us"). By accessing or using the Fanfie application, you agree to be bound by these Terms and Conditions.</p>
                <p>These terms apply to all users of the application, including without limitation users who are browsers, customers, and contributors of content.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">2. Use of Service</h2>
                <p className="mb-2">Fanfie provides a platform for users to capture, store, and share photos. You are responsible for your use of the Service and for any content you provide, including compliance with applicable laws, rules, and regulations.</p>
                <p>You may not use our Service for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
                <p className="mb-2">To access certain features of the Service, you may be required to register for an account. You must provide accurate, current, and complete information during the registration process and keep your account information up-to-date.</p>
                <p>You are responsible for safeguarding the password used to access your account and for any activities or actions under your password.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">4. Content</h2>
                <p className="mb-2">By submitting, posting or displaying Content on or through the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such Content.</p>
                <p>You are solely responsible for your Content and the consequences of posting or publishing it. We do not endorse, support, represent or guarantee the completeness, truthfulness, accuracy, or reliability of any Content.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">5. Prohibited Uses</h2>
                <p>In addition to other restrictions set forth in these Terms, you agree that you will not:</p>
                <ul className="list-disc pl-5 mb-2">
                  <li>Use the Service for any illegal purpose or in violation of any laws or regulations</li>
                  <li>Violate or infringe other people's intellectual property, privacy, publicity, or other legal rights</li>
                  <li>Post or share content that is harmful, abusive, pornographic, or objectionable</li>
                  <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
                  <li>Attempt to access the Service by any means other than through the interface provided by Fanfie</li>
                </ul>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">6. Termination</h2>
                <p>We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">7. Disclaimer</h2>
                <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We disclaim all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">8. Limitation of Liability</h2>
                <p>In no event shall Fanfie be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">9. Changes to Terms</h2>
                <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at support@fanfie.com.</p>
              </section>
            </div>
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleClose}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
