import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWordsPaginated, addWords, updateWordLevels, deleteWord } from '../../lib/queries';

const PAGE_SIZE = 50;
const PAGE_BLOCK_SIZE = 10;

interface Word {
  id: bigint;
  text: string;
  min_level: number;
  max_level: number;
  total_count: bigint;
}

interface NewWordEntry {
  text: string;
  min_level: number | string;
  max_level: number | string;
}

const ManageWords: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editingWords, setEditingWords] = useState<Record<string, { min_level: number | string; max_level: number | string }>>({});
  const [newWords, setNewWords] = useState<NewWordEntry[]>([{ text: '', min_level: 1, max_level: 3 }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [hoveredRowId, setHoveredRowId] = useState<bigint | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const { data: words, isLoading, error } = useQuery<Word[], Error>({
    queryKey: ['words', page, debouncedSearchTerm],
    queryFn: () => fetchWordsPaginated(page, PAGE_SIZE, debouncedSearchTerm),
    placeholderData: (previousData) => previousData,
  });

  const totalCount = words?.[0]?.total_count || 0;
  const totalPages = Math.ceil(Number(totalCount) / PAGE_SIZE);

  useEffect(() => {
    if (words) {
      const initialEditingState = words.reduce((acc, word) => {
        acc[word.id.toString()] = { min_level: word.min_level, max_level: word.max_level };
        return acc;
      }, {} as Record<string, { min_level: number | string; max_level: number | string }>);
      setEditingWords(initialEditingState);
    }
  }, [words]);

  const addMutation = useMutation({
    mutationFn: addWords,
    onSuccess: () => {
      alert('단어가 추가되었습니다.');
      setNewWords([{ text: '', min_level: 1, max_level: 3 }]);
      queryClient.invalidateQueries({ queryKey: ['words'] });
      setPage(1);
    },
    onError: (err) => alert(`오류: ${err.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: updateWordLevels,
    onSuccess: (data, variables) => {
      alert(`${variables.id}번 단어가 수정되었습니다.`);
      queryClient.invalidateQueries({ queryKey: ['words', page, debouncedSearchTerm] });
    },
    onError: (err) => alert(`오류: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWord,
    onSuccess: (data, variables) => {
      alert(`${variables}번 단어가 삭제되었습니다.`);
      queryClient.invalidateQueries({ queryKey: ['words'] });
    },
    onError: (err) => alert(`오류: ${err.message}`),
  });

  const handleAddNewWordRow = () => {
    setNewWords(prev => [...prev, { text: '', min_level: 1, max_level: 3 }]);
  };

  const handleRemoveNewWordRow = (index: number) => {
    setNewWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewWordChange = (index: number, field: keyof NewWordEntry, value: string | number) => {
    setNewWords(prev => 
      prev.map((word, i) => 
        i === index ? { ...word, [field]: value } : word
      )
    );
  };

  const handleSaveNewWords = () => {
    const wordsToAdd = newWords
      .filter(word => word.text.trim() !== '')
      .map(word => {
        const min_level = word.min_level === '' ? 0 : Number(word.min_level);
        const max_level = word.max_level === '' ? 0 : Number(word.max_level);
        if (isNaN(min_level) || isNaN(max_level)) {
          alert('유효하지 않은 레벨 값이 있습니다. 숫자를 입력해주세요.');
          return null;
        }
        return { text: word.text, min_level, max_level };
      })
      .filter((word): word is { text: string; min_level: number; max_level: number; } => word !== null);

    if (wordsToAdd.length > 0) {
      addMutation.mutate(wordsToAdd);
    }
  };

  const handleUpdateWord = (id: bigint) => {
    const levels = editingWords[id.toString()];
    if (levels) {
      const min_level = levels.min_level === '' ? 0 : Number(levels.min_level);
      const max_level = levels.max_level === '' ? 0 : Number(levels.max_level);
      
      if (isNaN(min_level) || isNaN(max_level)) {
        alert('레벨은 숫자여야 합니다.');
        return;
      }
      updateMutation.mutate({ id, min_level, max_level });
    }
  };

  const handleInputChange = (id: string, field: 'min_level' | 'max_level', value: string) => {
    const processedValue = value === '' ? '' : parseInt(value, 10);
    if (isNaN(processedValue as number)) {
      return; // Prevent non-numeric characters from being entered
    }
    setEditingWords(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: processedValue },
    }));
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const startPage = Math.floor((page - 1) / PAGE_BLOCK_SIZE) * PAGE_BLOCK_SIZE + 1;
    const endPage = Math.min(startPage + PAGE_BLOCK_SIZE - 1, totalPages);
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    const buttonStyle = {
      margin: '0 2px',
      padding: '5px 10px',
      cursor: 'pointer',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#ccc',
      backgroundColor: 'white',
      color: 'black',
    };

    const currentButtonStyle = {
      ...buttonStyle,
      backgroundColor: '#007bff',
      color: 'white',
      borderColor: '#007bff',
      fontWeight: 'bold',
    };

    return (
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button style={buttonStyle} onClick={() => setPage(1)} disabled={page === 1}>&laquo;</button>
        <button style={buttonStyle} onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>&lsaquo;</button>
        {pageNumbers.map(number => (
          <button 
            key={number} 
            onClick={() => setPage(number)} 
            style={page === number ? currentButtonStyle : buttonStyle}
          >
            {number}
          </button>
        ))}
        <button style={buttonStyle} onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page >= totalPages}>&rsaquo;</button>
        <button style={buttonStyle} onClick={() => setPage(totalPages)} disabled={page >= totalPages}>&raquo;</button>
      </div>
    );
  };

  if (isLoading && !words) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error.message}</div>;

  return (
    <div>
      <h3>단어 관리</h3>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h4>새 단어 추가</h4>
        {newWords.map((word, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <input type="text" placeholder="단어 입력" value={word.text} onChange={(e) => handleNewWordChange(index, 'text', e.target.value)} style={{width: '200px'}} />
            <label>Min:</label>
            <input 
              type="number" 
              value={word.min_level} 
              onChange={(e) => {
                const val = e.target.value;
                const processedValue = val === '' ? '' : parseInt(val, 10);
                if (isNaN(processedValue as number)) return;
                handleNewWordChange(index, 'min_level', processedValue);
              }} 
              style={{width: '60px'}} 
            />
            <label>Max:</label>
            <input 
              type="number" 
              value={word.max_level} 
              onChange={(e) => {
                const val = e.target.value;
                const processedValue = val === '' ? '' : parseInt(val, 10);
                if (isNaN(processedValue as number)) return;
                handleNewWordChange(index, 'max_level', processedValue);
              }} 
              style={{width: '60px'}} 
            />
            <button onClick={() => handleRemoveNewWordRow(index)} style={{padding: '2px 6px'}}>-</button>
          </div>
        ))}
        <button onClick={handleAddNewWordRow} style={{marginRight: '10px'}}>+</button>
        <button onClick={handleSaveNewWords} disabled={addMutation.isPending}>
          {addMutation.isPending ? '저장 중...' : '새 단어 저장'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="등록된 단어 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '300px', padding: '5px' }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{width: '5%'}}>ID</th>
            <th>Text</th>
            <th style={{width: '10%'}}>Min Level</th>
            <th style={{width: '10%'}}>Max Level</th>
            <th style={{width: '20%'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {words?.map(word => (
            <tr 
              key={word.id.toString()}
              onMouseEnter={() => setHoveredRowId(word.id)}
              onMouseLeave={() => setHoveredRowId(null)}
              style={{ backgroundColor: hoveredRowId === word.id ? '#f0f0f0' : 'transparent' }}
            >
              <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>{word.id.toString()}</td>
              <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>{word.text}</td>
              <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>
                <input type="number" value={editingWords[word.id.toString()]?.min_level ?? ''} onChange={(e) => handleInputChange(word.id.toString(), 'min_level', e.target.value)} style={{ width: '80%' }} />
              </td>
              <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>
                <input type="number" value={editingWords[word.id.toString()]?.max_level ?? ''} onChange={(e) => handleInputChange(word.id.toString(), 'max_level', e.target.value)} style={{ width: '80%' }} />
              </td>
              <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>
                <button onClick={() => handleUpdateWord(word.id)} disabled={updateMutation.isPending}>저장</button>
                <button onClick={() => deleteMutation.mutate(word.id)} disabled={deleteMutation.isPending} style={{marginLeft: '5px'}}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {renderPagination()}

    </div>
  );
};

export default ManageWords;