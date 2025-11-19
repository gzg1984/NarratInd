import React, { useState } from 'react';

const SkillTree = () => {
  const [skills, setSkills] = useState([
    { id: 1, name: '感染力提升', level: 0 },
    { id: 2, name: '致死率提升', level: 0 },
    { id: 3, name: '传播方式升级', level: 0 },
  ]);

  const upgradeSkill = (id) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, level: skill.level + 1 } : skill
    ));
  };

  return (
    <div className="skill-tree">
      <h2>技能树</h2>
      <ul>
        {skills.map(skill => (
          <li key={skill.id}>
            {skill.name} (等级: {skill.level})
            <button onClick={() => upgradeSkill(skill.id)}>升级</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SkillTree;