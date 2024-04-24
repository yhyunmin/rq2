import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchPosts, deletePost, updatePost } from './api';
import { PostDetail } from './PostDetail';
const maxPostPage = 10;

// 프리패치
// 데이터를 캐시에 넣어놓음
// 데이터는 stale로 간주
// 데이터를 사용해야할떄 stale이라
// 캐시에있는 데이터를 제공, 새로고침될떄까지 캐시에있는 데이터를 표시할 수 있음
// 프리페칭은 페이지네이션뿐 아니라 모든곳 사용가능
//
// isFetching vs isLoading
//  isFetching 비동기 쿼리 함수가 해결되지않앗을때 true
// isLoading 캐시된 데이터가 없음 + fetching 중
export function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  //프리패칭 하는 훅
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentPage < maxPostPage) {
      // 미리 가져오려는 데이터
      const nextPage = currentPage + 1;
      //프리패칭 하는 함수
      queryClient.prefetchQuery({
        queryKey: ['posts', nextPage],
        queryFn: () => fetchPosts(nextPage),
      });
    }
  }, [currentPage, queryClient]);

  const { data, isError, error, isLoading } = useQuery({
    queryKey: ['posts', currentPage],
    queryFn: () => fetchPosts(currentPage),
    staleTime: 2000, // 2 seconds
  });
  if (isLoading) {
    return <h3>Loading...</h3>;
  }
  if (isError) {
    return (
      <>
        <h3>Oops, something went wrong</h3>
        <p>{error.toString()}</p>
      </>
    );
  }

  return (
    <>
      <ul>
        {data.map(post => (
          <li
            key={post.id}
            className='post-title'
            onClick={() => setSelectedPost(post)}>
            {post.title}
          </li>
        ))}
      </ul>
      <div className='pages'>
        <button
          disabled={currentPage <= 1}
          onClick={() => {
            setCurrentPage(prev => prev - 1);
          }}
          Previous
          page></button>
        <span>Page {currentPage + 1}</span>
        <button
          disabled={currentPage >= maxPostPage}
          onClick={() => {
            setCurrentPage(prev => prev + 1);
          }}>
          Next page
        </button>
      </div>
      <hr />
      {selectedPost && <PostDetail post={selectedPost} />}
    </>
  );
}
