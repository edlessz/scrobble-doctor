type CardProps = {
  children: React.ReactNode;
  title: string;
};

const Card: React.FC<CardProps> = ({ children, title }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 ">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
};

export default Card;
