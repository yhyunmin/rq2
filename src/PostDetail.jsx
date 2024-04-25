import { useQuery } from '@tanstack/react-query';
import { fetchComments } from './api';
import './PostDetail.css';

// 코멘트가 업데이트 안되는 이유
// 코멘트라는 쿼리키를 모든postDetail에서 사용중
//  이럴땐 쿼리키를 트리거를 활용해 업데이트해야함
//
// postID 데이터를 갖고있으므로 쿼리마다 캐시할 수 있음
// 각포스테에대한 쿼리를 별도로 라벨링 할 수있음
//  퀴리키 에서 두번째 요소로, 키가 변경될떄마다 어떻게 처리할지 보여줌
// 이경우 post.id 가 바뀔때마다 stale시간과 캐시시간을  갖게됨
// 이때문에 데이터를 가져올 떄 쓰는 쿼리 함수의 모든 값이 키의 일부여야함
export function PostDetail({ post }) {
  // replace with useQuery
  // const data = [];
  const { data, isError, isLoading, error } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: () => fetchComments(post.id),
  });

  if (isLoading) {
    return <h3>Loading...</h3>;
  }
  if (isError) {
    return <h3>{error.toString()}</h3>;
  }
  return (
    <>
      <h3 style={{ color: 'blue' }}>{post.title}</h3>
      <button>Delete</button> <button>Update title</button>
      <p>{post.body}</p>
      <h4>Comments</h4>
      {data.map(comment => (
        <li key={comment.id}>
          {comment.email}: {comment.body}
        </li>
      ))}
    </>
  );
}
