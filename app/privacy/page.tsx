'use client';

import { useState } from 'react';

export default function PrivacyPolicy() {
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
              <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                <p className="mb-2">At Fanfie, we respect your privacy and are committed to protecting your personal data. This Privacy Policy will inform you about how we look after your personal data when you use our application and tell you about your privacy rights.</p>
                <p>This policy applies to information we collect when you use our application, or otherwise interact with us.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
                <p className="mb-2">We may collect, use, store, and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                <ul className="list-disc pl-5 mb-2">
                  <li><strong>Identity Data</strong>: includes username, name, or similar identifier.</li>
                  <li><strong>Contact Data</strong>: includes email address and telephone numbers.</li>
                  <li><strong>Technical Data</strong>: includes internet protocol (IP) address, your login data, browser type and version, device type, and other technology on the devices you use to access our application.</li>
                  <li><strong>Profile Data</strong>: includes your preferences, feedback, and survey responses.</li>
                  <li><strong>Usage Data</strong>: includes information about how you use our application.</li>
                  <li><strong>Content Data</strong>: includes photos and other content that you create, upload, or share through our application.</li>
                </ul>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
                <p className="mb-2">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                <ul className="list-disc pl-5 mb-2">
                  <li>To provide and maintain our Service</li>
                  <li>To notify you about changes to our Service</li>
                  <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                  <li>To provide customer care and support</li>
                  <li>To provide analysis or valuable information so that we can improve the Service</li>
                  <li>To monitor the usage of the Service</li>
                  <li>To detect, prevent and address technical issues</li>
                </ul>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">4. Data Sharing and Disclosure</h2>
                <p className="mb-2">We may share your personal information in the following situations:</p>
                <ul className="list-disc pl-5 mb-2">
                  <li><strong>With Service Providers</strong>: We may share your personal information with service providers to monitor and analyze the use of our Service, to host your photos, or to contact you.</li>
                  <li><strong>For Business Transfers</strong>: We may share or transfer your personal information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                  <li><strong>With Your Consent</strong>: We may disclose your personal information for any other purpose with your consent.</li>
                  <li><strong>To Comply with Legal Obligations</strong>: We may disclose your information where we are legally required to do so.</li>
                </ul>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
                <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">6. Your Data Protection Rights</h2>
                <p className="mb-2">You have the following data protection rights:</p>
                <ul className="list-disc pl-5 mb-2">
                  <li>The right to access, update or to delete the personal information we have on you</li>
                  <li>The right of rectification - You have the right to have your information rectified if that information is inaccurate or incomplete</li>
                  <li>The right to object - You have the right to object to our processing of your Personal Data</li>
                  <li>The right of restriction - You have the right to request that we restrict the processing of your personal information</li>
                  <li>The right to data portability - You have the right to be provided with a copy of the information we have on you in a structured, machine-readable and commonly used format</li>
                  <li>The right to withdraw consent - You also have the right to withdraw your consent at any time where we relied on your consent to process your personal information</li>
                </ul>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">7. Cookies and Tracking Technologies</h2>
                <p>We use cookies and similar tracking technologies to track the activity on our Service and store certain information. For more information about our use of cookies, please see our Cookie Policy.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">8. Children's Privacy</h2>
                <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">9. Changes to this Privacy Policy</h2>
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at privacy@fanfie.com.</p>
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
