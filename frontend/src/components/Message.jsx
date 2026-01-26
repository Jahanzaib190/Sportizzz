const Message = ({ variant, children }) => {
  // dynamic color based on variant (error = red, info = blue)
  const color = variant === 'danger' ? 'bg-red-500' : 'bg-blue-500';
  return (
    <div className={`${color} text-white p-4 rounded-lg mb-4 flex items-center`}>
      {children}
    </div>
  );
};
Message.defaultProps = { variant: 'info' };
export default Message;