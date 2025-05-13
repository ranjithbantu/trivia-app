import { screen, fireEvent, waitFor } from '@testing-library/react';
import StartPage from '@components/StartPage';
import { renderWithProviders } from './testUtils';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Interface is now imported from testUtils

describe('<StartPage />', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the create-quiz button disabled by default', async () => {
    renderWithProviders({
      categories: {
        items: [{ _id: '9', name: 'General Knowledge', count: 10 }],
        status: 'ready'
      }
    });
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /create quiz/i });
      expect(button).toBeDisabled();
    });
  });

  it('should have initial state of 5 questions and easy difficulty', async () => {
    renderWithProviders({
      categories: {
        items: [{ _id: '9', name: 'General Knowledge', count: 10 }],
        status: 'ready'
      }
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Questions: 5/)).toBeInTheDocument();
      expect(screen.getByText(/Difficulty: easy/)).toBeInTheDocument();
    });
  });

  it('should update difficulty when slider is moved', async () => {
    renderWithProviders({
      categories: {
        items: [{ _id: '9', name: 'General Knowledge', count: 10 }],
        status: 'ready'
      }
    });

    const slider = screen.getByRole('slider', { name: /difficulty level/i });
    
    await waitFor(() => {
      fireEvent.change(slider, { target: { value: '1' } });
      expect(screen.getByText(/Difficulty: medium/)).toBeInTheDocument();
      
      fireEvent.change(slider, { target: { value: '2' } });
      expect(screen.getByText(/Difficulty: hard/)).toBeInTheDocument();
    });
  });

  it('should update number of questions when slider is moved', async () => {
    renderWithProviders({
      categories: {
        items: [{ _id: '9', name: 'General Knowledge', count: 10 }],
        status: 'ready'
      }
    });

    const slider = screen.getByRole('slider', { name: /number of questions/i });
    
    await waitFor(() => {
      fireEvent.change(slider, { target: { value: '10' } });
      expect(screen.getByText(/Questions: 10/)).toBeInTheDocument();
    });
  });

  it('should enable create quiz button when category is selected', async () => {
    renderWithProviders({
      categories: {
        items: [{ _id: '9', name: 'General Knowledge', count: 10 }],
        status: 'ready'
      }
    });

    const select = screen.getByRole('combobox', { name: /choose category/i });
    
    await waitFor(() => {
      fireEvent.change(select, { target: { value: '9' } });
      expect(screen.getByRole('button', { name: /create quiz/i })).toBeEnabled();
    });
  });

  it('should navigate to quiz page with correct params when form is submitted', async () => {
    renderWithProviders({
      categories: {
        items: [{ _id: '9', name: 'General Knowledge', count: 10 }],
        status: 'ready'
      }
    });

    // Select category
    const select = screen.getByRole('combobox', { name: /choose category/i });
    fireEvent.change(select, { target: { value: '9' } });

    // Set difficulty to medium
    const difficultySlider = screen.getByRole('slider', { name: /difficulty level/i });
    fireEvent.change(difficultySlider, { target: { value: '1' } });

    // Set questions to 8
    const questionsSlider = screen.getByRole('slider', { name: /number of questions/i });
    fireEvent.change(questionsSlider, { target: { value: '8' } });

    // Click create quiz
    const button = screen.getByRole('button', { name: /create quiz/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/9/8/medium');
    });
  });

  it('should show error state if categories fetch fails', async () => {
    renderWithProviders({
      categories: {
        items: [],
        status: 'error'
      }
    });
    
    await waitFor(() => {
      expect(screen.getByText(/couldn't load categories/i)).toBeInTheDocument();
    });
  });
});