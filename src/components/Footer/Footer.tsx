import "./Footer.css";

function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-row">
          <div className="footer-col">
            <h4>Project management</h4>
            <ul className="links">
              <li>
                <p>Task creation and assignment</p>
              </li>
              <li>
                <p>Milestone tracking</p>
              </li>
              <li>
                <p>Progress visualization with charts</p>
              </li>
              <li>
                <p>Deadline reminders</p>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Team Collaboration</h4>
            <ul className="links">
              <li>
                <p>Document and file sharing</p>
              </li>
              <li>
                <p>Role-based access control</p>
              </li>
              <li>
                <p>Commenting and activity feed</p>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Marketplace Integration</h4>
            <ul className="links">
              <li>
                <p>Explore new ideas</p>
              </li>
              <li>
                <p>Upload and market projects, programs, and scripts</p>
              </li>
              <li>
                <p>Secure payment processing</p>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Reach Us</h4>
            <ul className="links">
              <li>
                <p>Contact</p>
              </li>
              <li>
                <p>progpathapp@gmail.com</p>
              </li>
            </ul>
          </div>
        </div>
      </footer>
      <div className="copyright">
        <span>© 2024 ProgPath</span>
      </div>
    </>
  );
}

export default Footer;
