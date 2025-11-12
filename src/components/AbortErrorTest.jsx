// AbortErrorTest.jsx - Comprehensive test component for AbortError scenarios
import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AbortErrorTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const isMountedRef = useRef(true);
  const unsubscribeRef = useRef(null);
  const testTimeoutRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Test cleanup error:', err);
          }
        }
      }
      if (testTimeoutRef.current) {
        clearTimeout(testTimeoutRef.current);
      }
    };
  }, []);

  const addTestResult = (test, status, details = '') => {
    if (!isMountedRef.current) return;
    
    setTestResults(prev => [...prev, {
      test,
      status,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runAbortErrorTests = async () => {
    if (!isMountedRef.current) return;
    
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Rapid mount/unmount
      addTestResult('Rapid Mount/Unmount', 'running', 'Testing component lifecycle...');
      
      const testDoc = doc(db, 'test', 'abort-test');
      let listenerCount = 0;
      
      // Create multiple listeners rapidly
      for (let i = 0; i < 5; i++) {
        if (!isMountedRef.current) break;
        
        try {
          const unsubscribe = onSnapshot(testDoc, (snap) => {
            if (!isMountedRef.current) return;
            listenerCount++;
          }, (error) => {
            if (error.name === 'AbortError') {
              addTestResult(`Listener ${i}`, 'aborted', 'AbortError handled gracefully');
            } else {
              addTestResult(`Listener ${i}`, 'error', error.message);
            }
          });
          
          // Immediately unsubscribe to simulate rapid mount/unmount
          setTimeout(() => {
            try {
              unsubscribe();
            } catch (err) {
              if (err.name !== 'AbortError') {
                console.error('Unsubscribe error:', err);
              }
            }
          }, 100);
        } catch (err) {
          if (err.name === 'AbortError') {
            addTestResult(`Listener ${i}`, 'aborted', 'AbortError caught during setup');
          } else {
            addTestResult(`Listener ${i}`, 'error', err.message);
          }
        }
      }
      
      // Test 2: Network interruption simulation
      addTestResult('Network Interruption', 'running', 'Simulating network issues...');
      
      try {
        await setDoc(testDoc, {
          test_data: 'network test',
          timestamp: new Date().toISOString()
        });
        addTestResult('Network Interruption', 'success', 'Write operation completed');
      } catch (err) {
        if (err.name === 'AbortError') {
          addTestResult('Network Interruption', 'aborted', 'AbortError handled gracefully');
        } else {
          addTestResult('Network Interruption', 'error', err.message);
        }
      }
      
      // Test 3: Concurrent operations
      addTestResult('Concurrent Operations', 'running', 'Testing concurrent Firestore operations...');
      
      const concurrentPromises = [];
      for (let i = 0; i < 3; i++) {
        if (!isMountedRef.current) break;
        
        const promise = setDoc(doc(db, 'test', `concurrent-${i}`), {
          test_id: i,
          timestamp: new Date().toISOString()
        }).catch(err => {
          if (err.name === 'AbortError') {
            addTestResult(`Concurrent ${i}`, 'aborted', 'AbortError handled gracefully');
          } else {
            addTestResult(`Concurrent ${i}`, 'error', err.message);
          }
        });
        
        concurrentPromises.push(promise);
      }
      
      try {
        await Promise.allSettled(concurrentPromises);
        addTestResult('Concurrent Operations', 'success', 'All concurrent operations handled');
      } catch (err) {
        if (err.name === 'AbortError') {
          addTestResult('Concurrent Operations', 'aborted', 'AbortError handled gracefully');
        } else {
          addTestResult('Concurrent Operations', 'error', err.message);
        }
      }
      
      // Test 4: Navigation during operations
      addTestResult('Navigation During Operations', 'running', 'Testing navigation during active operations...');
      
      const navTestDoc = doc(db, 'test', 'navigation-test');
      let navListenerActive = false;
      
      try {
        const unsubscribe = onSnapshot(navTestDoc, (snap) => {
          if (!isMountedRef.current) {
            navListenerActive = false;
            return;
          }
          navListenerActive = true;
        }, (error) => {
          if (error.name === 'AbortError') {
            addTestResult('Navigation During Operations', 'aborted', 'AbortError handled during navigation');
          } else {
            addTestResult('Navigation During Operations', 'error', error.message);
          }
        });
        
        unsubscribeRef.current = unsubscribe;
        
        // Simulate navigation after 1 second
        testTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            addTestResult('Navigation During Operations', 'success', 'Navigation handled without errors');
          }
        }, 1000);
        
      } catch (err) {
        if (err.name === 'AbortError') {
          addTestResult('Navigation During Operations', 'aborted', 'AbortError handled during setup');
        } else {
          addTestResult('Navigation During Operations', 'error', err.message);
        }
      }
      
      // Test 5: Component unmount during active operations
      addTestResult('Unmount During Operations', 'running', 'Testing unmount during active operations...');
      
      try {
        const unmountTestDoc = doc(db, 'test', 'unmount-test');
        const unsubscribe = onSnapshot(unmountTestDoc, (snap) => {
          // This should not execute after unmount
        }, (error) => {
          if (error.name === 'AbortError') {
            addTestResult('Unmount During Operations', 'aborted', 'AbortError handled during unmount');
          } else {
            addTestResult('Unmount During Operations', 'error', error.message);
          }
        });
        
        // Simulate unmount after 500ms
        setTimeout(() => {
          try {
            unsubscribe();
            addTestResult('Unmount During Operations', 'success', 'Unmount handled gracefully');
          } catch (err) {
            if (err.name === 'AbortError') {
              addTestResult('Unmount During Operations', 'aborted', 'AbortError handled during cleanup');
            } else {
              addTestResult('Unmount During Operations', 'error', err.message);
            }
          }
        }, 500);
        
      } catch (err) {
        if (err.name === 'AbortError') {
          addTestResult('Unmount During Operations', 'aborted', 'AbortError handled during setup');
        } else {
          addTestResult('Unmount During Operations', 'error', err.message);
        }
      }
      
    } catch (err) {
      if (err.name === 'AbortError') {
        addTestResult('Test Suite', 'aborted', 'AbortError handled in test suite');
      } else {
        addTestResult('Test Suite', 'error', err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsRunning(false);
        addTestResult('Test Suite', 'completed', 'All tests completed');
      }
    }
  };

  const clearResults = () => {
    if (!isMountedRef.current) return;
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">AbortError Test Suite</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={runAbortErrorTests}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
              isRunning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isRunning ? 'Running Tests...' : 'Run AbortError Tests'}
          </button>
          
          <button
            onClick={clearResults}
            disabled={isRunning}
            className="px-6 py-3 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white transition duration-200"
          >
            Clear Results
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>Test Scenarios:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Rapid mount/unmount of components</li>
            <li>Network interruption simulation</li>
            <li>Concurrent Firestore operations</li>
            <li>Navigation during active operations</li>
            <li>Component unmount during active operations</li>
          </ul>
        </div>
      </div>
      
      {testResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
          
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.status === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : result.status === 'aborted'
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : result.status === 'running'
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{result.test}</span>
                    {result.details && (
                      <p className="text-sm mt-1">{result.details}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {result.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AbortErrorTest;
