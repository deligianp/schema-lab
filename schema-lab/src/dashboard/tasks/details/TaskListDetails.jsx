import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import React, { useContext, createContext } from 'react';
import { TasksContext } from "../TasksListProvider";
import { Link } from 'react-router-dom';


export const TaskDetailsContext = createContext();

export const useTaskDetails = () => {
    return useContext(TaskDetailsContext);
};

// Get all the details related to a specific Task UUID
const TaskListDetails = () => {
    const { uuid } = useParams();
    const { taskData } = useContext(TasksContext);

    const navigate = useNavigate();

    // Find the selected task based on taskId
    const selectedTask = taskData && taskData.results.find(task => task.uuid === uuid);

    return (
        <TaskDetailsContext.Provider value={selectedTask}>
        <div>
            <div>
                <small class="lead">UUID: {uuid} </small>
                <Navbar bg="light" data-bs-theme="light">
                    <Container>
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="name">Name </Nav.Link>
                            <Nav.Link as={Link} to="status">Status </Nav.Link>
                            <Nav.Link as={Link} to="executors">Executors </Nav.Link>
                            <Nav.Link as={Link} to="stdout">Stdout</Nav.Link>
                            <Nav.Link as={Link} to="stderr">Stderr</Nav.Link>
                            <Nav.Link as={Link} to="inputs">Inputs</Nav.Link>
                            <Nav.Link as={Link} to="outputs">Outputs</Nav.Link>
                        </Nav>
                    </Container>
                </Navbar>
                <Outlet />
            </div>
            <div class="mt-3">
                <Button variant="primary" onClick={() => navigate("/Dashboard")}>Back</Button>
            </div>
        </div> 
        </TaskDetailsContext.Provider>
    );
};

export default TaskListDetails;