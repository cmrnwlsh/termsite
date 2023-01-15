import {Col, Container, Row} from "react-bootstrap";
import Form from 'react-bootstrap/Form'
import {useRef, useState} from "react";
import {useMediaQuery} from 'react-responsive'

function App() {
    const prompt = 'user@terminal:~'
    const input = useRef('')
    const dir = useRef('home')
    const dirs = useRef({home: {'helloworld.txt': 'hello world',
                                             'testfile.txt': 'test file'}})
    const [output, setOutput] = useState(['Enter a command, type "help" for list'])
    const line = arr => setOutput(arr.concat(output))
    const commands = {
        cls: () => setOutput(['Enter a command, type "help" for list']),
        ls: () => line(['  ' + Object.keys(dirs.current[dir.current]).join(' '), 'ls: ']),
        help: () => line([
            '  ls- list dir contents',
            '  cls- clear screen',
            '  cd- change directory',
            'help:'])
    }
    const parseCommand = command =>
        command in commands ?
            commands[command]() :
            line(['command not recognized: ' + command])

    const isMobile = useMediaQuery({query: '(max-width: 1224px)'})
    return (
        <div style={{height: '100vh', fontSize: isMobile ? '.5rem' : '1rem'}}>
            <div className={'mx-auto shadow-lg pb-5 pt-2 mb-5 ml-5 mt-5 bg-dark rounded'}
                 style={{
                     height: '65vh',
                     width: '75vw',
                     minWidth: 380
                     }}>
                <Container className={'mb-3'}
                           style={{
                               height: '99%',
                               overflow: 'scroll',
                               display: 'flex',
                               flexDirection: 'column-reverse',
                               whiteSpace: 'pre-wrap'
                           }}>
                    {Array.from(output).map(line =>
                        <Row><code className={'text-success'}>{line}</code></Row>)}
                </Container>
                <Container>
                    <Row xs={'auto'}>
                        <Col><code>{prompt}</code></Col>
                        <Col xs={8}>
                            <Form onSubmit={event => {
                                parseCommand(input.current.value)
                                console.log(input.current.value)
                                input.current.value = ''
                                event.preventDefault()
                            }}>
                                <Form.Control className={'text-secondary'}
                                              style={{
                                                  height: isMobile ? 12 : 24,
                                                  width: '99%',
                                                  fontSize: isMobile ? '.5rem' : '1rem',}}
                                              ref={input}/>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
}

export default App;
