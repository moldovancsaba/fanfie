'use client';

import { useState } from 'react';

export default function CookiePolicy() {
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
              <h1 className="text-2xl font-bold mb-4">Cookie Policy</h1>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                <p className="mb-2">This Cookie Policy explains how Fanfie ("we", "us", and "our") uses cookies and similar technologies to recognize you when you visit our application. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>
                <p>In some cases we may use cookies to collect personal information, or that becomes personal information if we combine it with other information.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">2. What are cookies?</h2>
                <p className="mb-2">Cookies are small data files that are placed on your computer or mobile device when you visit a website or use an application. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
                <p>Cookies set by the website owner (in this case, Fanfie) are called "first party cookies". Cookies set by parties other than the website owner are called "third party cookies". Third party cookies enable third party features or functionality to be provided on or through the website (e.g. like advertising, interactive content and analytics). The parties that set these third party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">3. Why do we use cookies?</h2>
                <p className="mb-2">We use first and third party cookies for several reasons. Some cookies are required for technical reasons in order for our application to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our application. Third parties serve cookies through our application for advertising, analytics and other purposes.</p>
                <p>The specific types of first and third party cookies served through our application and the purposes they perform are described below:</p>
                <ul className="list-disc pl-5 mb-2">
                  <li><strong>Essential cookies</strong>: These cookies are strictly necessary to provide you with services available through our application and to use some of its features, such as access to secure areas.</li>
                  <li><strong>Performance and functionality cookies</strong>: These cookies are used to enhance the performance and functionality of our application but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.</li>
                  <li><strong>Analytics and customization cookies</strong>: These cookies collect information that is used either in aggregate form to help us understand how our application is being used or how effective our marketing campaigns are, or to help us customize our application for you.</li>
                  <li><strong>Advertising cookies</strong>: These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.</li>
                </ul>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">4. How can you control cookies?</h2>
                <p className="mb-2">You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by clicking on the appropriate opt-out links provided in our cookie notice.</p>
                <p className="mb-2">You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our application though your access to some functionality and areas of our application may be restricted. As the means by which you can refuse cookies through your web browser controls vary from browser-to-browser, you should visit your browser's help menu for more information.</p>
                <p>In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more information, please visit <a href="http://www.aboutads.info/choices/" className="text-blue-500 hover:underline">http://www.aboutads.info/choices/</a> or <a href="http://www.youronlinechoices.com" className="text-blue-500 hover:underline">http://www.youronlinechoices.com</a>.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">5. What about other tracking technologies, like web beacons?</h2>
                <p>Cookies are not the only way to recognize or track visitors to a website. We may use other, similar technologies from time to time, like web beacons (sometimes called "tracking pixels" or "clear gifs"). These are tiny graphics files that contain a unique identifier that enable us to recognize when someone has visited our application or opened an e-mail including them. This allows us, for example, to monitor the traffic patterns of users from one page within a website to another, to deliver or communicate with cookies, to understand whether you have come to the website from an online advertisement displayed on a third-party website, to improve site performance, and to measure the success of e-mail marketing campaigns. In many instances, these technologies are reliant on cookies to function properly, and so declining cookies will impair their functioning.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">6. Do you use Flash cookies or Local Shared Objects?</h2>
                <p>Websites may also use so-called "Flash Cookies" (also known as Local Shared Objects or "LSOs") to, among other things, collect and store information about your use of our services, fraud prevention and for other site operations.</p>
                <p>If you do not want Flash Cookies stored on your computer, you can adjust the settings of your Flash player to block Flash Cookies storage using the tools contained in the <a href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html" className="text-blue-500 hover:underline">Website Storage Settings Panel</a>.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">7. Do you serve targeted advertising?</h2>
                <p>Third parties may serve cookies on your computer or mobile device to serve advertising through our application. These companies may use information about your visits to this and other websites in order to provide relevant advertisements about goods and services that you may be interested in. They may also employ technology that is used to measure the effectiveness of advertisements. This can be accomplished by them using cookies or web beacons to collect information about your visits to this and other sites in order to provide relevant advertisements about goods and services of potential interest to you.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">8. How often will you update this Cookie Policy?</h2>
                <p>We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.</p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold mb-2">9. Where can I get further information?</h2>
                <p>If you have any questions about our use of cookies or other technologies, please email us at cookies@fanfie.com.</p>
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
