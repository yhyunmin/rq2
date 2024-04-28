import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

  // useMutation 하는법
  const deleteMutation = useMutation({
    mutationFn: postId => deletePost(postId),
  });

  const updateMutation = useMutation({
    mutationFn: postId => updatePost(postId),
  });

  // deleteMutation.mutate
  // updateMutation.mutate
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
            onClick={() => {
              deleteMutation.reset();
              updateMutation.reset();
              setSelectedPost(post);
            }}>
            {post.title}
          </li>
        ))}
      </ul>
      <div className='pages'>
        <button
          disabled={currentPage <= 1}
          onClick={() => {
            setCurrentPage(prev => prev - 1);
          }}></button>
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
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          deleteMutation={deleteMutation}
          updateMutation={updateMutation}
        />
      )}
    </>
  );
}

// 0425 mutation
//서버에 네트워크 호출해 서버에서 실제 데이터를 업데이트하는것
// 즉 블로그 포스트 추가 , 삭제 포스트 제목 변경 ( CRUD)
// 변경사항을 보여주거나, 볼수있게 발생했다는것 등록하는 방법
// 낙관적 업데이트 : 호출이 잘될거라 가정하고 안됐을 경우 되돌리는방법
// 서버에서받은 데이터를 가져와 변이호출을 실행할떄 업데이트된 데이터를 가져와 리액트 쿼리 캐시업데이트하기
// 관련쿼리를 무효화하는 방법
// 쿼리를 무효화하면 클라이언트데이터와 서버의데이터와 동기화하기위해 재요청을 함

//  useMutation 사용
// mutate를 반환함
// query key가 필요없음 = 데이터를 저장하지 않음
// isFetching은 없고 isLoading 은 있음
//  useQuery는 기본 재시도 3번  여기는 없음 (설정으로 자동재시도 가능)
