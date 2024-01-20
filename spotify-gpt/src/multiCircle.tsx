import "./index.css";

export const MultiCircle = (): JSX.Element => {
  return (
    <div className="multi-circle">
      <div className="overlap-group">
        <img className="ellipse" alt="Ellipse" src="/img/ellipse-1.svg" />
        <img className="img" alt="Ellipse" src="/img/ellipse-2.svg" />
        <img className="ellipse-2" alt="Ellipse" src="/img/ellipse-3.svg" />
      </div>
    </div>
  );
};
