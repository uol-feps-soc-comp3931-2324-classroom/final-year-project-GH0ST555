import React from 'react';
import Select from 'react-select';

const SE_Dropdown = ({selectedOption,setSelectedOption}) => {
    //The array here is different to the MM operations dropdown as it allows images to be used along with text.
    const options = [
        { value: 'Single Node', label: (<div><img src="/Node.png" alt="Node" style={{ width: 30, height: 30, marginRight: 10 }}/>Node</div>) },
        { value: 'cross shaped(No Edges)', label: (<div><img src="/Cross.png" alt="Cross Shaped" style={{ width: 70, height: 70, marginRight: 10 }}/>Cross Shaped without edges</div>) },
        { value: 'Node + Edge + RNode', label: (<div><img src="/RNbor.png" alt="Node with Neighbor" style={{ width: 30, height: 30, marginRight: 10 }}/>Node origin with right neighbour and edge</div>)},
        { value: 'Horizontal Edge', label: (<div><img src="/Horizontal.png" alt="Horizontal Edge" style={{ width: 70, height: 70, marginRight: 10 }}/>Horizontal Edge</div>)},
        { value: 'Vertical Edge', label: (<div><img src="/Vertical.png" alt="Vertical Edge" style={{ width: 70, height: 70, marginRight: 10 }}/>Vertical Edge</div>)},
        { value: 'Custom SE', label: (<div>Custom Structuring Element</div>)},
    ];

    // Handler for when an option is selected
    const handleChange = (selected) => {
        setSelectedOption(selected);
    };

    return (
        <Select
            options={options}
            value={selectedOption}
            onChange={handleChange} 
        />
    );
};

export default SE_Dropdown;
