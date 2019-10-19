interface WorkPlace {
    name: string;
    position: string;
    yearsOfExperience: number;
}

export interface Item {
    name: string;
    age: number;
    sex: string;
    interests: Array<string>;
    married?: boolean;
    work?: Array<WorkPlace>;
}

const Items: Array<Item> = [
    {
        name: 'Mary',
        age: 23,
        sex: 'f',
        interests: ['knitting', 'coffee'],
        work: [
            {
                name: 'Mary\'s coffee',
                position: 'CEO',
                yearsOfExperience: 1
            }
        ]
    },
    {
        name: 'Brian',
        age: 32,
        sex: 'm',
        married: true,
        interests: ['bikes', 'music', 'dogs'],
        work: [
            {
                name: 'Bristol pines',
                position: 'Rescue team instructor',
                yearsOfExperience: 12
            },
            {
                name: 'Panini\'s Pizza',
                position: 'Delivery boy',
                yearsOfExperience: 2
            }
        ]
    },
    {
        name: 'Conor',
        age: 15,
        sex: 'm',
        interests: ['dota2', 'cybersports']
    },
    {
        name: 'Old Lady Gibson',
        age: 65,
        sex: 'f',
        married: true,
        interests: ['old rusty debris', 'dogs']
    }
];

export default Items;
