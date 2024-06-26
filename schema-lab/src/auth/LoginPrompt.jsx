import React, { useState } from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Alert from "react-bootstrap/Alert";
import config from "../config";

const LoginPrompt = props => {

    /* Three cases:
     *  No login provider has been passed
     *  One login provider has been passed
     *  Multiple login providers have been passed
     */
    const [selectedLoginProviderId, setSelectedLoginProviderId] = useState('');
    const availableLoginProviders = config.auth.loggin_providers.reduce((availableLoginProviders, { id, loginProviderName, LoginProvider }) => {
        availableLoginProviders[id] = { loginProviderName, LoginProvider };
        return availableLoginProviders;
    }, {});
    const handleSelectOptionChanged = evt => {
        const _selectedLoginProviderId = evt.target.value;
        setSelectedLoginProviderId(_selectedLoginProviderId);
    }
    const EffectiveLoginProvider = availableLoginProviders[selectedLoginProviderId] && availableLoginProviders[selectedLoginProviderId].LoginProvider;

    if (Object.keys(availableLoginProviders).length === 0) {
        return <Alert variant="danger">
            <Alert.Heading>No login has been configured</Alert.Heading>
            <p>You may have to contact the administrators of the current domain to notify for this issue</p>
        </Alert>
    }
    else {
        return <Row>
            <Col>
                <Row>
                    <Col>
                        <p className="display-6">Login</p>
                        <p>Use your credentials to log in and gain access to the SCHEMA lab features</p>
                    </Col>
                </Row>
                <Row className="ps-3">
                    <Col>
                        <Row>
                            <Col>
                                <Form.Group controlId="formBasicPassword">
                                    <Form.Select aria-label="Default select example" onChange={handleSelectOptionChanged}>
                                        <option value="">Select a way to authenticate</option>
                                        {Object.keys(availableLoginProviders).map(id => <option key={`key-[${id}]`} value={id}>{availableLoginProviders[id].loginProviderName}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="ps-3 mt-3">
                            <Col>
                                {EffectiveLoginProvider && <EffectiveLoginProvider />}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
        </Row>;
    }
}

export default LoginPrompt;