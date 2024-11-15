import "./Section.css";

interface SectionProps {
  title: string;
  text: string;
  isLeft: boolean;
}

const Section: React.FC<SectionProps> = ({ title, text, isLeft }) => {
  return (
    <>
      <section className="main-container">
        <div className="inner-container">
          <div
            className="content"
            data-aos="fade-up"
            data-aos-offset="0"
            data-aos-delay="0"
          >
            {isLeft ? (
              <h1 className="title">{title}</h1>
            ) : (
              <p className="text">{text}</p>
            )}
          </div>
          <div
            className="content"
            data-aos="fade-right"
            data-aos-offset="0"
            data-aos-delay="0"
          >
            {isLeft ? (
              <p className="text">{text}</p>
            ) : (
              <h1 className="title">{title}</h1>
            )}
          </div>
        </div>
      </section>
      <div className="border-div"></div>
    </>
  );
};

export default Section;
