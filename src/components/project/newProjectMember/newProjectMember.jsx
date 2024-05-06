import { getAllUser } from "../../../api/getAllUsers"
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { createNewProjectMember } from "../../../api/createNewProjectMember";
import { getMembersList } from "../../../api/getMembersList";

export default function NewProjectMember() {

    const [jwt, setJwt] = useState(Cookies.get('jwt') ? Cookies.get('jwt') : null);
    const [userData, setUserData] = useState(Cookies.get('userData') ? JSON.parse(Cookies.get('userData')) : null);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [newMembers, setNewMembers] = useState([]);
    const [membersList, setMembersList] = useState([]);
    const [search, setSearch] = useState('');
    const [newMembersUsernames, setNewMembersUsernames] = useState([]);
    const location = useLocation();

    // Get the project uuid in the url
    const urlParams = new URLSearchParams(location.search);
    const projectUuid = urlParams.get('uuid');

    
    // Get the users list and the project members list
    useEffect(() => {
        getUsers();
        getProjectMembers();
        newMembersUsernames;
    }, []);

    // 

    // Filter the users list based on the search input
    useEffect(() => {
        if (search) {
            const filteredUsers = users.filter(user => user.username.toLowerCase().includes(search.toLowerCase()));
            setFilteredUsers(filteredUsers);
        } else {
            setFilteredUsers(users); // Afficher tous les utilisateurs lorsque la recherche est vide
        }
    }, [search, users]);

    // Get the users lists
    async function getUsers() {
        const usersList = await getAllUser(jwt);
        setUsers(usersList);
    }

    // Get the project members list
    async function getProjectMembers() {
        try {
            const data = await getMembersList(projectUuid, jwt);
            setMembersList(data);
        } catch (error) {
            console.log("Une erreur est survenue lors de la récupération des membres du projet", error);
        }
    }

    // Check if the user is already a member of the project
    function checkIfMemberExists(user) {
        return membersList.filter(member => member.username === user.username).length !== 0;
    }

    // Handle the checkbox change
    function handleCheckboxChange(event) {
        const value = event.target.value;
        const isChecked = event.target.checked;
        const username = event.target.id;
        if (isChecked) {
            setNewMembers(prevMembers => [...prevMembers, value]);
            setNewMembersUsernames(prevMembers => [...prevMembers, username]);
        } else {
            setNewMembers(prevMembers => prevMembers.filter(member => member !== value));
            setNewMembersUsernames(prevMembers => prevMembers.filter(member => member !== username));
        }
    }

    // Add the new members to the project
    function addNewMembers() {

        if (newMembers.length === 0) {
            return;
        } 

        const membersToAdd = newMembersUsernames.join(', ');

        const confirmation = confirm(`Voulez-vous vraiment ajouter ${newMembersUsernames.length} membres à ce projet ? ${'( ' + membersToAdd + ' )'}`);

        if (!confirmation) {
            return;
        }

        newMembers.map(member => {
            // Set the new member data
            const data = {
                project_uuid: projectUuid,
                user_uuid: member,
                role: 'Membre'
            }

            // Add the new member to the project
            createNewProjectMember(data, jwt);

            // Stock the message in the cookies
            Cookies.set('message', 'Membres ajoutés avec success');

            // Redirect to the project details page
            window.location.href = `/detail-projet/?uuid=${projectUuid}`;
        })
    }

    return (
        <div className="newProjectMember">
            <h3>Ajouter des membres</h3>
            <div>
                <p>Rechercher par pseudo:</p>
                <input type="text" id="member-search" name="member-search" onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="membersList">
                {filteredUsers.map(user => {
                    if ((userData.username !== user.username)) {
                        if (!checkIfMemberExists(user)) {
                            return (
                                <div key={user.username}>
                                    <input type="checkbox" id={user.username} value={user.uuid} onChange={handleCheckboxChange} />
                                    <label htmlFor={user.uuid}>{user.username}</label>
                                </div>
                            );
                        } else {
                            return null;
                        }

                    } else {
                        return null;
                    }
                })}
            </div>
            <button onClick={addNewMembers}>Ajouter</button>
        </div>
    )
}