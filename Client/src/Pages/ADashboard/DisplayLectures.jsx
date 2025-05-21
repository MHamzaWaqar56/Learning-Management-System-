import { MdAutoDelete } from "react-icons/md";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
  padding: 2.5rem 5%;
  color: white;
`;

const CourseTitle = styled.div`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #facc15; /* Tailwind yellow-500 */
`;

const LectureWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  width: 100%;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const LectureBox = styled.div`
  width: 100%;
  max-width: 28rem;
  height: 35rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px black;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LectureHeader = styled.div`
  font-weight: 600;
  font-size: 1.25rem;
  color: #facc15;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AddButton = styled.button`
  background-color: #3b82f6; /* Tailwind blue-500 */
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: white;
  transition: background-color 0.3s ease-in-out;
  &:hover {
    background-color: #2563eb; /* blue-600 */
  }
`;

const LectureList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
`;

const LectureItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LectureText = styled.p`
  cursor: pointer;
  color: white;
  span {
    font-size: 1rem;
    font-weight: 500;
    margin-right: 0.5rem;
  }
`;

const DeleteButton = styled.button`
  font-size: 1.5rem;
  font-weight: 600;
  color: #ef4444; /* red-500 */
  transition: color 0.2s;
  &:hover {
    color: #dc2626; /* red-600 */
  }
`;

const BottomButton = styled.button`
  background-color: #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1.125rem;
  color: white;
  transition: background-color 0.3s ease-in-out;
  &:hover {
    background-color: #2563eb;
  }
`;

function Displaylectures() {
  return (
      <Wrapper>
        <CourseTitle>Course Name: React</CourseTitle>

        <LectureWrapper>
          <LectureBox>
            <LectureHeader>
              <p>Lectures list</p>
              <AddButton>Add new lecture</AddButton>
            </LectureHeader>

            <LectureList>
              <LectureItem>
                <LectureText>
                  <span>Lecture 1:</span> React Hooks
                </LectureText>
                <DeleteButton>
                  <MdAutoDelete />
                </DeleteButton>
              </LectureItem>
            </LectureList>
          </LectureBox>
        </LectureWrapper>

        <BottomButton>Add new lecture</BottomButton>
      </Wrapper>
  );
}

export default Displaylectures;
