import React from 'react';

const EventBar = ({ onEventTrigger }) => {
  const handleButtonClick = (event) => {
    onEventTrigger(event.target.value);
  };

  return (
    <div className="event-bar">
      <h2>事件触发区</h2>
      <button value="infect" onClick={handleButtonClick}>感染</button>
      <button value="cure" onClick={handleButtonClick}>治愈</button>
      <button value="upgrade" onClick={handleButtonClick}>升级技能</button>
    </div>
  );
};

export default EventBar;